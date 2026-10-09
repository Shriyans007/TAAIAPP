<?php
/**
 * Plugin Name: TAAI Mobile API
 * Description: Secure mobile APIs for TAAI APP.
 * Version: 1.6.0
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;
define('TAAI_MOBILE_PATH', plugin_dir_path(__FILE__));
foreach (['security','auth','google-auth','users','membership','events','gallery','directory','push-tokens','notifications','account-deletion','rest-api'] as $file) {
    require_once TAAI_MOBILE_PATH . 'includes/class-' . $file . '.php';
}
register_activation_hook(__FILE__, ['TAAI_Mobile_Security', 'activate']);
add_action('rest_api_init', ['TAAI_Mobile_REST_API', 'register_routes']);
add_action('admin_menu', ['TAAI_Mobile_Notifications', 'admin_menu']);
add_action('admin_menu', ['TAAI_Mobile_Google_Auth', 'admin_menu']);
add_action('init', ['TAAI_Mobile_Directory', 'register_content_type']);
add_action('init', ['TAAI_Mobile_Gallery', 'register_content_type']);
add_action('add_meta_boxes', ['TAAI_Mobile_Directory', 'add_meta_boxes']);
add_action('add_meta_boxes', ['TAAI_Mobile_Gallery', 'add_meta_boxes']);
add_action('save_post_' . TAAI_Mobile_Directory::POST_TYPE, ['TAAI_Mobile_Directory', 'save']);
add_action('save_post_' . TAAI_Mobile_Gallery::POST_TYPE, ['TAAI_Mobile_Gallery', 'save']);
add_action('admin_enqueue_scripts', ['TAAI_Mobile_Gallery', 'enqueue_admin_assets']);
add_action('after_password_reset', ['TAAI_Mobile_Security', 'revoke_for_password_change'], 10, 1);
add_action('profile_update', ['TAAI_Mobile_Security', 'revoke_for_profile_password_change'], 10, 2);
add_filter('wp_authenticate_user', ['TAAI_Mobile_Security', 'block_deleted_account'], 10, 2);
