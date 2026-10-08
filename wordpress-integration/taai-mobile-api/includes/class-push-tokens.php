<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Push_Tokens {
    private const MAX_TOKENS_PER_USER = 5;

    public static function save(WP_REST_Request $r) {
        global $wpdb;
        $user_id = TAAI_Mobile_Security::user_id();
        $token = sanitize_text_field($r['token']);
        if (!preg_match('/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/', $token)) return new WP_Error('taai_invalid_push_token', 'Invalid push token.', ['status' => 400]);
        if (!TAAI_Mobile_Security::account_rate_limit('push-token', (string) $user_id, 10)) return new WP_Error('taai_rate_limited', 'Please wait before updating notification settings again.', ['status' => 429]);
        $raw_preferences = is_array($r['preferences']) ? $r['preferences'] : [];
        $preferences = [];
        foreach (['events', 'community', 'membership'] as $key) {
            $preferences[$key] = isset($raw_preferences[$key]) ? (bool) $raw_preferences[$key] : true;
        }
        $existing = $wpdb->get_var($wpdb->prepare("SELECT user_id FROM {$wpdb->prefix}taai_mobile_push_tokens WHERE token = %s", $token));
        if ($existing && (int) $existing !== $user_id) return new WP_Error('taai_push_token_in_use', 'This device notification token belongs to another session. Log out there first.', ['status' => 409]);
        $count = (int) $wpdb->get_var($wpdb->prepare("SELECT COUNT(*) FROM {$wpdb->prefix}taai_mobile_push_tokens WHERE user_id = %d", $user_id));
        if (!$existing && $count >= self::MAX_TOKENS_PER_USER) return new WP_Error('taai_push_token_limit', 'Too many devices are registered. Log out of an old device and try again.', ['status' => 409]);
        $saved = $wpdb->replace("{$wpdb->prefix}taai_mobile_push_tokens", ['user_id' => $user_id, 'token' => $token, 'preferences' => wp_json_encode($preferences), 'updated_at' => current_time('mysql', true)]);
        if (!$saved) return new WP_Error('taai_push_token_failed', 'Notification settings could not be saved.', ['status' => 500]);
        return ['success' => true];
    }

    public static function delete(WP_REST_Request $r) {
        global $wpdb;
        $where = ['user_id' => TAAI_Mobile_Security::user_id()];
        $formats = ['%d'];
        $token = sanitize_text_field($r['token']);
        if ($token) {
            $where['token'] = $token;
            $formats[] = '%s';
        }
        $wpdb->delete("{$wpdb->prefix}taai_mobile_push_tokens", $where, $formats);
        return ['success' => true];
    }
}

