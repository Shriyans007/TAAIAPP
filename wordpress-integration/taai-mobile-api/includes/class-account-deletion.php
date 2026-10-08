<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Account_Deletion {
    public static function run(WP_REST_Request $r) {
        global $wpdb;
        $id = TAAI_Mobile_Security::user_id();
        $user = get_userdata($id);
        if (!$user || user_can($user, 'manage_options')) return new WP_Error('taai_deletion_forbidden', 'This account cannot be deleted here.', ['status' => 403]);
        if (!TAAI_Mobile_Security::account_rate_limit('delete-account', (string) $id, 5)) return new WP_Error('taai_rate_limited', 'Please wait before trying again.', ['status' => 429]);
        if (!wp_check_password((string) $r['password'], $user->user_pass, $id)) return new WP_Error('taai_reauthentication_failed', 'Password confirmation failed.', ['status' => 401]);
        $anonymous = 'deleted-' . $id . '@invalid.taai.local';
        $updated = wp_update_user(['ID' => $id, 'user_email' => $anonymous, 'user_url' => '', 'display_name' => 'Deleted TAAI User', 'first_name' => '', 'last_name' => '', 'nickname' => 'Deleted TAAI User', 'description' => '']);
        if (is_wp_error($updated)) return new WP_Error('taai_deletion_failed', 'The account could not be anonymised. Please contact TAAI.', ['status' => 500]);
        $keys = ['billing_first_name','billing_last_name','billing_company','billing_email','billing_phone','billing_address_1','billing_address_2','billing_city','billing_postcode','billing_state','billing_country','shipping_first_name','shipping_last_name','shipping_company','shipping_address_1','shipping_address_2','shipping_city','shipping_postcode','shipping_state','shipping_country'];
        foreach ($keys as $key) delete_user_meta($id, $key);
        $avatar_id = absint(get_user_meta($id, 'taai_mobile_avatar_id', true));
        if ($avatar_id && absint(get_post_meta($avatar_id, '_taai_mobile_profile_avatar', true)) === $id) {
            wp_delete_attachment($avatar_id, true);
        }
        delete_user_meta($id, 'taai_mobile_avatar_id');
        update_user_meta($id, 'taai_mobile_deleted', 1);
        TAAI_Mobile_Security::revoke_user_sessions($id);
        $wpdb->delete("{$wpdb->prefix}taai_mobile_push_tokens", ['user_id' => $id], ['%d']);
        return ['success' => true, 'behaviour' => 'Website and mobile login disabled and personal profile anonymised. WooCommerce transaction records are retained for legal and accounting obligations.'];
    }
}

