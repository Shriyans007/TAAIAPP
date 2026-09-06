<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Directory {
    const POST_TYPE = 'taai_business';

    public static function register_content_type(): void {
        register_post_type(self::POST_TYPE, [
            'labels' => [
                'name' => 'Member Discounts',
                'singular_name' => 'Member Discount',
                'add_new_item' => 'Add Participating Business',
                'edit_item' => 'Edit Participating Business',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'taai-mobile-notifications',
            'supports' => ['title', 'editor', 'thumbnail', 'page-attributes'],
            'menu_icon' => 'dashicons-store',
        ]);
    }

    public static function add_meta_boxes(): void {
        add_meta_box('taai_business_details', 'Member Discount Details', [self::class, 'render_meta_box'], self::POST_TYPE, 'normal', 'high');
    }

    public static function render_meta_box(WP_Post $post): void {
        wp_nonce_field('taai_business_save', 'taai_business_nonce');
        $fields = ['category' => 'Category', 'discount' => 'Member discount or offer', 'address' => 'Address', 'phone' => 'Phone', 'website' => 'Website URL', 'directions_url' => 'Directions URL'];
        foreach ($fields as $key => $label) {
            $value = get_post_meta($post->ID, '_taai_' . $key, true);
            echo '<p><label><strong>' . esc_html($label) . '</strong></label><br>';
            echo '<input class="widefat" type="text" name="taai_' . esc_attr($key) . '" value="' . esc_attr($value) . '"></p>';
        }
        echo '<p>Use the main content editor for the description and Featured Image for the business image.</p>';
    }

    public static function save(int $post_id): void {
        if (!isset($_POST['taai_business_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['taai_business_nonce'])), 'taai_business_save')) return;
        if ((defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) || !current_user_can('edit_post', $post_id)) return;
        foreach (['category', 'discount', 'address', 'phone', 'website', 'directions_url'] as $key) {
            if (!isset($_POST['taai_' . $key])) continue;
            $value = wp_unslash($_POST['taai_' . $key]);
            $clean = in_array($key, ['website', 'directions_url'], true) ? esc_url_raw($value) : sanitize_text_field($value);
            update_post_meta($post_id, '_taai_' . $key, $clean);
        }
    }

    private static function is_eligible(int $user_id): bool {
        if (!function_exists('wcs_get_users_subscriptions')) return false;
        foreach (wcs_get_users_subscriptions($user_id) as $subscription) {
            if (in_array($subscription->get_status(), ['active', 'pending-cancel'], true)) return true;
        }
        return false;
    }

    public static function get() {
        $user_id = TAAI_Mobile_Security::user_id();
        if (is_wp_error($user_id)) return $user_id;
        if (!self::is_eligible($user_id)) return new WP_Error('taai_membership_required', 'An active TAAI membership is required to access member discounts.', ['status' => 403]);
        $posts = get_posts(['post_type' => self::POST_TYPE, 'post_status' => 'publish', 'posts_per_page' => 100, 'orderby' => ['menu_order' => 'ASC', 'title' => 'ASC']]);
        $businesses = array_map(function ($post) {
            return [
                'id' => (int) $post->ID,
                'name' => html_entity_decode(get_the_title($post), ENT_QUOTES, 'UTF-8'),
                'category' => sanitize_text_field(get_post_meta($post->ID, '_taai_category', true)),
                'description' => wp_strip_all_tags($post->post_content),
                'discount' => sanitize_text_field(get_post_meta($post->ID, '_taai_discount', true)),
                'address' => sanitize_text_field(get_post_meta($post->ID, '_taai_address', true)),
                'phone' => sanitize_text_field(get_post_meta($post->ID, '_taai_phone', true)),
                'website' => esc_url_raw(get_post_meta($post->ID, '_taai_website', true)),
                'directionsUrl' => esc_url_raw(get_post_meta($post->ID, '_taai_directions_url', true)),
                'image' => get_the_post_thumbnail_url($post, 'medium') ?: null,
            ];
        }, $posts);
        return ['eligibility' => 'eligible', 'instructions' => 'Show your active TAAI membership to the participating business before ordering or paying. Offers and conditions are set by each business.', 'businesses' => $businesses];
    }
}
