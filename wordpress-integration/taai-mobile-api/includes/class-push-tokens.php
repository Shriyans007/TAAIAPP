<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Push_Tokens {
    public static function save(WP_REST_Request $r) { global $wpdb;$token=sanitize_text_field($r['token']);if(!preg_match('/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/',$token))return new WP_Error('taai_invalid_push_token','Invalid push token.',['status'=>400]);$wpdb->replace("{$wpdb->prefix}taai_mobile_push_tokens",['user_id'=>TAAI_Mobile_Security::user_id(),'token'=>$token,'preferences'=>wp_json_encode($r['preferences']??[]),'updated_at'=>current_time('mysql',true)]);return ['success'=>true]; }
    public static function delete(WP_REST_Request $r) { global $wpdb;$wpdb->delete("{$wpdb->prefix}taai_mobile_push_tokens",['user_id'=>TAAI_Mobile_Security::user_id(),'token'=>sanitize_text_field($r['token'])]);return ['success'=>true]; }
}

