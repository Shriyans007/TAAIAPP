<?php
/**
 * Plugin Name: TAAI Mobile API
 * Description: Secure mobile APIs for TAAI APP.
 * Version: 1.0.1
 * Requires PHP: 7.4
 */
defined('ABSPATH') || exit;
define('TAAI_MOBILE_PATH', plugin_dir_path(__FILE__));
foreach (['security','auth','users','membership','push-tokens','notifications','account-deletion','rest-api'] as $file) {
    require_once TAAI_MOBILE_PATH . 'includes/class-' . $file . '.php';
}
register_activation_hook(__FILE__, ['TAAI_Mobile_Security', 'activate']);
add_action('rest_api_init', ['TAAI_Mobile_REST_API', 'register_routes']);
add_action('admin_menu', ['TAAI_Mobile_Notifications', 'admin_menu']);
