<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Auth {
    public static function login(WP_REST_Request $r) {
        if (!TAAI_Mobile_Security::rate_limit('login', 8)) return new WP_Error('taai_rate_limited', 'Please wait before trying again.', ['status' => 429]);
        $identifier = sanitize_text_field($r['identifier']); $password = (string) $r['password'];
        if (!$identifier || !$password) return new WP_Error('taai_invalid_login', 'Enter your username/email and password.', ['status' => 400]);
        $user = wp_authenticate($identifier, $password);
        if (is_wp_error($user) && is_email($identifier)) { $by_email = get_user_by('email', $identifier); if ($by_email) $user = wp_authenticate($by_email->user_login, $password); }
        if (is_wp_error($user)) return new WP_Error('taai_invalid_credentials', 'The username/email or password is incorrect.', ['status' => 401]);
        if (get_user_meta($user->ID, 'taai_mobile_deleted', true)) return new WP_Error('taai_account_unavailable', 'This account is unavailable.', ['status' => 403]);
        return self::issue($user);
    }
    private static function issue(WP_User $user) { global $wpdb; $raw = bin2hex(random_bytes(32)); $wpdb->insert("{$wpdb->prefix}taai_mobile_sessions", ['user_id'=>$user->ID,'token_hash'=>hash('sha256',$raw),'expires_at'=>gmdate('Y-m-d H:i:s',time()+30*DAY_IN_SECONDS),'created_at'=>current_time('mysql',true)]); return ['token'=>$raw,'expiresIn'=>30*DAY_IN_SECONDS,'user'=>TAAI_Mobile_Users::profile($user->ID)]; }
    public static function logout() { global $wpdb; $token = TAAI_Mobile_Security::bearer(); if ($token) $wpdb->delete("{$wpdb->prefix}taai_mobile_sessions", ['token_hash'=>hash('sha256',$token)]); return ['success'=>true]; }
    public static function register(WP_REST_Request $r) { if (!get_option('users_can_register')) return new WP_Error('taai_registration_disabled','Registration is currently unavailable.',['status'=>403]); $email=sanitize_email($r['email']);$login=sanitize_user($r['username'],true);$password=(string)$r['password']; if(!is_email($email)||strlen($password)<10||!$login)return new WP_Error('taai_invalid_registration','Check the account details. Passwords need at least 10 characters.',['status'=>400]);$id=wp_create_user($login,$password,$email);if(is_wp_error($id))return $id;wp_update_user(['ID'=>$id,'first_name'=>sanitize_text_field($r['firstName']),'last_name'=>sanitize_text_field($r['lastName']),'role'=>'customer']);return self::issue(get_user_by('id',$id)); }
    public static function forgot(WP_REST_Request $r) { if(!TAAI_Mobile_Security::rate_limit('forgot',5))return new WP_Error('taai_rate_limited','Please wait before trying again.',['status'=>429]);$_POST['user_login']=sanitize_text_field($r['identifier']);retrieve_password();return ['message'=>'If the account exists, WordPress will send its normal password reset email.']; }
}
