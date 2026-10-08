<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Events {
    private const CATEGORY_SLUG = 'taaievents';

    private static function product_data(WC_Product $product): array {
        $image_id = $product->get_image_id();
        $image = $image_id ? wp_get_attachment_image_url($image_id, 'full') : false;
        $thumbnail = $image_id ? wp_get_attachment_image_url($image_id, 'medium') : false;
        $attributes = [];

        foreach ($product->get_attributes() as $attribute) {
            $terms = [];
            if ($attribute->is_taxonomy()) {
                $names = wc_get_product_terms($product->get_id(), $attribute->get_name(), ['fields' => 'names']);
                foreach ($names as $name) $terms[] = ['name' => $name];
            } else {
                foreach ($attribute->get_options() as $option) $terms[] = ['name' => (string) $option];
            }
            $attributes[] = ['name' => wc_attribute_label($attribute->get_name()), 'terms' => $terms];
        }

        return [
            'id' => $product->get_id(),
            'name' => $product->get_name(),
            'slug' => $product->get_slug(),
            'description' => $product->get_description(),
            'short_description' => $product->get_short_description(),
            'permalink' => get_permalink($product->get_id()),
            'is_in_stock' => $product->is_in_stock(),
            'images' => $image ? [['src' => $image, 'thumbnail' => $thumbnail ?: $image]] : [],
            'attributes' => $attributes,
            'extensions' => ['taai_event' => []],
        ];
    }

    public static function list() {
        if (!function_exists('wc_get_products')) {
            return new WP_Error('taai_woocommerce_unavailable', 'Events are temporarily unavailable.', ['status' => 503]);
        }

        $products = wc_get_products([
            'status' => 'publish',
            'limit' => 100,
            'category' => [self::CATEGORY_SLUG],
            'orderby' => 'date',
            'order' => 'DESC',
        ]);

        return rest_ensure_response(array_map([self::class, 'product_data'], $products));
    }

    public static function get(WP_REST_Request $request) {
        $id = absint($request->get_param('id'));
        if (!$id) return new WP_Error('taai_invalid_event', 'Invalid event.', ['status' => 400]);
        if (!function_exists('wc_get_product')) return new WP_Error('taai_woocommerce_unavailable', 'Events are temporarily unavailable.', ['status' => 503]);

        $product = wc_get_product($id);
        if (!$product || $product->get_status() !== 'publish' || !has_term(self::CATEGORY_SLUG, 'product_cat', $id)) {
            return new WP_Error('taai_event_missing', 'This event is unavailable.', ['status' => 404]);
        }

        return rest_ensure_response(self::product_data($product));
    }
}
