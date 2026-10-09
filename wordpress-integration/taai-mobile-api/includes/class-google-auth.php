<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Google_Auth {
    private const SUBJECT_META = 'taai_mobile_google_sub';
    private const EMAIL_META = 'taai_mobile_google_email';
    private const CERTS_TRANSIENT = 'taai_mobile_google_certs';

    public static function admin_menu(): void {
        add_submenu_page(
            'taai-mobile',
            'Google Login',
            'Google Login',
            'manage_options',
            'taai-mobile-google',
            [self::class, 'settings_page']
        );
    }

    public static function settings_page(): void {
        if (!current_user_can('manage_options')) wp_die('Forbidden');
        $notice = '';
        if (isset($_POST['taai_google_save'])) {
            check_admin_referer('taai_google_settings');
            $raw = sanitize_textarea_field(wp_unslash($_POST['google_client_ids'] ?? ''));
            $ids = preg_split('/[\s,]+/', $raw, -1, PREG_SPLIT_NO_EMPTY);
            $ids = array_values(array_unique(array_filter(array_map('sanitize_text_field', $ids))));
            $invalid = array_filter($ids, function ($id) {
                return !preg_match('/^[A-Za-z0-9._-]+\.apps\.googleusercontent\.com$/', $id);
            });
            if ($invalid) {
                $notice = '<div class="notice notice-error"><p>Enter valid Google OAuth client IDs only.</p></div>';
            } else {
                update_option('taai_mobile_google_client_ids', implode("\n", $ids), false);
                $notice = '<div class="notice notice-success"><p>Google login settings saved.</p></div>';
            }
        }
        $configured_by_constant = defined('TAAI_MOBILE_GOOGLE_CLIENT_IDS');
        $saved = (string) get_option('taai_mobile_google_client_ids', '');
        echo '<div class="wrap"><h1>TAAI Mobile Google Login</h1>' . wp_kses_post($notice);
        echo '<p>Add the public OAuth client IDs for the TAAI iOS, Android and optional web apps. Add one ID per line. Never enter a client secret.</p>';
        if ($configured_by_constant) {
            echo '<div class="notice notice-info"><p>Google client IDs are currently controlled by <code>TAAI_MOBILE_GOOGLE_CLIENT_IDS</code> in wp-config.php.</p></div>';
        }
        echo '<form method="post">';
        wp_nonce_field('taai_google_settings');
        echo '<textarea class="large-text code" rows="7" name="google_client_ids" ' . disabled($configured_by_constant, true, false) . '>' . esc_textarea($saved) . '</textarea>';
        echo '<p><button class="button button-primary" name="taai_google_save" ' . disabled($configured_by_constant, true, false) . '>Save Google Client IDs</button></p>';
        echo '</form></div>';
    }

    public static function login(WP_REST_Request $request) {
        if (!TAAI_Mobile_Security::rate_limit('google-login', 20)) {
            return new WP_Error('taai_rate_limited', 'Please wait before trying again.', ['status' => 429]);
        }
        $claims = self::verify_request($request);
        if (is_wp_error($claims)) return $claims;
        $user = self::user_for_subject($claims['sub']);
        if (!$user) {
            return new WP_Error(
                'taai_google_not_linked',
                'This Google account is not linked yet. Log in with your TAAI password, then link Google in Account Settings.',
                ['status' => 401]
            );
        }
        if (get_user_meta($user->ID, 'taai_mobile_deleted', true)) {
            return new WP_Error('taai_account_unavailable', 'This account is unavailable.', ['status' => 403]);
        }
        return TAAI_Mobile_Auth::issue($user);
    }

    public static function register(WP_REST_Request $request) {
        if (!get_option('users_can_register')) {
            return new WP_Error('taai_registration_disabled', 'Registration is currently unavailable.', ['status' => 403]);
        }
        if (!TAAI_Mobile_Security::rate_limit('google-register', 5)) {
            return new WP_Error('taai_rate_limited', 'Please wait before trying again.', ['status' => 429]);
        }
        $claims = self::verify_request($request);
        if (is_wp_error($claims)) return $claims;
        $linked = self::user_for_subject($claims['sub']);
        if ($linked) return TAAI_Mobile_Auth::issue($linked);
        if (get_user_by('email', $claims['email'])) {
            return new WP_Error(
                'taai_google_existing_account',
                'A TAAI account already uses this email. Log in with its password first, then link Google in Account Settings.',
                ['status' => 409]
            );
        }
        if (!TAAI_Mobile_Security::account_rate_limit('google-register', $claims['email'], 2)) {
            return new WP_Error('taai_rate_limited', 'Please wait before trying again.', ['status' => 429]);
        }
        $login = self::unique_login($claims['email']);
        $user_id = wp_insert_user([
            'user_login' => $login,
            'user_email' => $claims['email'],
            'user_pass' => wp_generate_password(32, true, true),
            'first_name' => $claims['given_name'],
            'last_name' => $claims['family_name'],
            'display_name' => trim($claims['given_name'] . ' ' . $claims['family_name']) ?: $login,
            'role' => 'customer',
        ]);
        if (is_wp_error($user_id)) return $user_id;
        self::save_link((int) $user_id, $claims);
        return TAAI_Mobile_Auth::issue(get_user_by('id', $user_id));
    }

    public static function link(WP_REST_Request $request) {
        $claims = self::verify_request($request);
        if (is_wp_error($claims)) return $claims;
        $user_id = TAAI_Mobile_Security::user_id();
        $already_linked = self::user_for_subject($claims['sub']);
        if ($already_linked && (int) $already_linked->ID !== $user_id) {
            return new WP_Error(
                'taai_google_already_linked',
                'That Google account is already linked to another TAAI account.',
                ['status' => 409]
            );
        }
        self::save_link($user_id, $claims);
        return ['success' => true, 'user' => TAAI_Mobile_Users::profile($user_id)];
    }

    private static function save_link(int $user_id, array $claims): void {
        update_user_meta($user_id, self::SUBJECT_META, $claims['sub']);
        update_user_meta($user_id, self::EMAIL_META, $claims['email']);
    }

    private static function user_for_subject(string $subject) {
        $users = get_users([
            'meta_key' => self::SUBJECT_META,
            'meta_value' => $subject,
            'number' => 1,
            'count_total' => false,
        ]);
        return $users ? $users[0] : null;
    }

    private static function unique_login(string $email): string {
        $base = sanitize_user(strstr($email, '@', true), true);
        if (!$base) $base = 'taai-member';
        $candidate = $base;
        $suffix = 1;
        while (username_exists($candidate)) {
            $candidate = $base . '-' . $suffix;
            $suffix++;
        }
        return $candidate;
    }

    private static function verify_request(WP_REST_Request $request) {
        $token = (string) $request['idToken'];
        if (!$token || strlen($token) > 10000) {
            return new WP_Error('taai_google_token_missing', 'Google sign-in could not be verified.', ['status' => 400]);
        }
        return self::verify_id_token($token);
    }

    private static function verify_id_token(string $token) {
        $allowed_audiences = self::allowed_client_ids();
        if (!$allowed_audiences) {
            return new WP_Error('taai_google_not_configured', 'Google sign-in is not configured yet.', ['status' => 503]);
        }
        $parts = explode('.', $token);
        if (count($parts) !== 3) return self::invalid_token();
        $header = json_decode(self::base64url_decode($parts[0]), true);
        $claims = json_decode(self::base64url_decode($parts[1]), true);
        $signature = self::base64url_decode($parts[2]);
        if (!is_array($header) || !is_array($claims) || $signature === false) return self::invalid_token();
        if (($header['alg'] ?? '') !== 'RS256' || empty($header['kid'])) return self::invalid_token();
        $certs = self::google_certs();
        if (is_wp_error($certs)) return $certs;
        $kid = sanitize_text_field($header['kid']);
        if (empty($certs[$kid])) return self::invalid_token();
        $verified = openssl_verify($parts[0] . '.' . $parts[1], $signature, $certs[$kid], OPENSSL_ALGO_SHA256);
        if ($verified !== 1) return self::invalid_token();
        $now = time();
        $issuer = $claims['iss'] ?? '';
        $audiences = is_array($claims['aud'] ?? null) ? $claims['aud'] : [$claims['aud'] ?? ''];
        if (!in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)) return self::invalid_token();
        if (!array_intersect($allowed_audiences, $audiences)) return self::invalid_token();
        if (empty($claims['exp']) || (int) $claims['exp'] < $now - 60) return self::invalid_token();
        if (!empty($claims['iat']) && (int) $claims['iat'] > $now + 300) return self::invalid_token();
        $email_verified = $claims['email_verified'] ?? false;
        if ($email_verified !== true && $email_verified !== 'true') return self::invalid_token();
        $email = sanitize_email($claims['email'] ?? '');
        $subject = sanitize_text_field($claims['sub'] ?? '');
        if (!is_email($email) || !$subject || strlen($subject) > 255) return self::invalid_token();
        return [
            'sub' => $subject,
            'email' => $email,
            'given_name' => sanitize_text_field($claims['given_name'] ?? ''),
            'family_name' => sanitize_text_field($claims['family_name'] ?? ''),
        ];
    }

    private static function allowed_client_ids(): array {
        $configured = defined('TAAI_MOBILE_GOOGLE_CLIENT_IDS')
            ? constant('TAAI_MOBILE_GOOGLE_CLIENT_IDS')
            : get_option('taai_mobile_google_client_ids', '');
        if (is_string($configured)) $configured = preg_split('/[\s,]+/', $configured, -1, PREG_SPLIT_NO_EMPTY);
        if (!is_array($configured)) $configured = [];
        $configured = apply_filters('taai_mobile_google_client_ids', $configured);
        return array_values(array_unique(array_filter(array_map('sanitize_text_field', $configured))));
    }

    private static function google_certs() {
        $cached = get_transient(self::CERTS_TRANSIENT);
        if (is_array($cached) && $cached) return $cached;
        $response = wp_remote_get('https://www.googleapis.com/oauth2/v1/certs', [
            'timeout' => 8,
            'sslverify' => true,
        ]);
        if (is_wp_error($response) || wp_remote_retrieve_response_code($response) !== 200) {
            return new WP_Error('taai_google_unavailable', 'Google sign-in is temporarily unavailable.', ['status' => 503]);
        }
        $certs = json_decode(wp_remote_retrieve_body($response), true);
        if (!is_array($certs) || !$certs) {
            return new WP_Error('taai_google_unavailable', 'Google sign-in is temporarily unavailable.', ['status' => 503]);
        }
        set_transient(self::CERTS_TRANSIENT, $certs, 6 * HOUR_IN_SECONDS);
        return $certs;
    }

    private static function base64url_decode(string $value) {
        $remainder = strlen($value) % 4;
        if ($remainder) $value .= str_repeat('=', 4 - $remainder);
        return base64_decode(strtr($value, '-_', '+/'), true);
    }

    private static function invalid_token(): WP_Error {
        return new WP_Error('taai_google_invalid_token', 'Google sign-in could not be verified.', ['status' => 401]);
    }
}
