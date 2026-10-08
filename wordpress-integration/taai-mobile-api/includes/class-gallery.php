<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Gallery {
    public const POST_TYPE = 'taai_gallery_album';
    private const IMAGE_META_KEY = '_taai_gallery_image_ids';

    public static function register_content_type(): void {
        register_post_type(self::POST_TYPE, [
            'labels' => [
                'name' => 'Event Galleries',
                'singular_name' => 'Event Gallery',
                'add_new_item' => 'Add Event Gallery',
                'edit_item' => 'Edit Event Gallery',
            ],
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => 'taai-mobile',
            'supports' => ['title'],
            'menu_icon' => 'dashicons-format-gallery',
        ]);
    }

    public static function add_meta_boxes(): void {
        add_meta_box('taai-gallery-images', 'Album Photos', [self::class, 'meta_box'], self::POST_TYPE, 'normal', 'high');
    }

    public static function meta_box(WP_Post $post): void {
        $ids = self::image_ids($post->ID);
        wp_nonce_field('taai_gallery_save', 'taai_gallery_nonce');
        echo '<p>Select or upload the photos for this event. The first photo is used as the album cover.</p>';
        echo '<input type="hidden" id="taai-gallery-image-ids" name="taai_gallery_image_ids" value="' . esc_attr(implode(',', $ids)) . '">';
        echo '<div id="taai-gallery-preview" style="display:flex;flex-wrap:wrap;gap:10px;margin:12px 0">';
        foreach ($ids as $id) {
            $url = wp_get_attachment_image_url($id, 'thumbnail');
            if ($url) echo '<div data-id="' . esc_attr($id) . '"><img src="' . esc_url($url) . '" width="100" height="100" style="object-fit:cover;border-radius:6px"></div>';
        }
        echo '</div><button type="button" class="button button-primary" id="taai-gallery-select">Select / Upload Photos</button> ';
        echo '<button type="button" class="button" id="taai-gallery-clear">Clear Photos</button>';
    }

    public static function enqueue_admin_assets(): void {
        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== self::POST_TYPE) return;
        wp_enqueue_media();
        wp_enqueue_script('taai-mobile-gallery-admin', plugins_url('../assets/gallery-admin.js', __FILE__), ['jquery'], '1.0.0', true);
    }

    public static function save(int $post_id): void {
        if (!isset($_POST['taai_gallery_nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['taai_gallery_nonce'])), 'taai_gallery_save')) return;
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) return;
        if (!current_user_can('edit_post', $post_id)) return;

        $raw = isset($_POST['taai_gallery_image_ids']) ? sanitize_text_field(wp_unslash($_POST['taai_gallery_image_ids'])) : '';
        $ids = array_values(array_unique(array_filter(array_map('absint', explode(',', $raw)))));
        $ids = array_values(array_filter($ids, function ($id) {
            return wp_attachment_is_image($id) && !get_post_meta($id, '_taai_mobile_profile_avatar', true);
        }));
        update_post_meta($post_id, self::IMAGE_META_KEY, $ids);
    }

    private static function image_ids(int $album_id): array {
        $ids = get_post_meta($album_id, self::IMAGE_META_KEY, true);
        return is_array($ids) ? array_values(array_filter(array_map('absint', $ids))) : [];
    }

    private static function photos(int $album_id): array {
        $photos = [];
        foreach (self::image_ids($album_id) as $id) {
            $full = wp_get_attachment_image_url($id, 'large');
            if (!$full) $full = wp_get_attachment_url($id);
            if (!$full) continue;
            $thumbnail = wp_get_attachment_image_url($id, 'medium') ?: $full;
            $photos[] = [
                'id' => $id,
                'title' => get_the_title($id),
                'caption' => wp_get_attachment_caption($id) ?: '',
                'thumbnail' => $thumbnail,
                'full' => $full,
                'mediaType' => 'image',
            ];
        }
        return $photos;
    }

    public static function albums(): WP_REST_Response {
        $query = new WP_Query([
            'post_type' => self::POST_TYPE,
            'post_status' => 'publish',
            'posts_per_page' => 100,
            'orderby' => 'date',
            'order' => 'DESC',
            'no_found_rows' => true,
        ]);
        $albums = [];
        foreach ($query->posts as $post) {
            $photos = self::photos($post->ID);
            $albums[] = [
                'id' => $post->ID,
                'name' => get_the_title($post),
                'slug' => $post->post_name,
                'cover' => $photos[0]['thumbnail'] ?? null,
                'photoCount' => count($photos),
                'photos' => $photos,
            ];
        }
        return rest_ensure_response($albums);
    }
}
