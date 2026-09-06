<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Events {
    public static function list() {
        $request = new WP_REST_Request('GET', '/wc/store/v1/products');
        $request->set_query_params(['category' => '112', 'per_page' => '20']);
        $response = rest_do_request($request);
        if ($response->is_error()) return $response->as_error();
        return rest_ensure_response($response->get_data());
    }

    public static function get(WP_REST_Request $request) {
        $id = absint($request->get_param('id'));
        if (!$id) return new WP_Error('taai_invalid_event', 'Invalid event.', ['status' => 400]);
        $response = rest_do_request(new WP_REST_Request('GET', '/wc/store/v1/products/' . $id));
        if ($response->is_error()) return $response->as_error();
        return rest_ensure_response($response->get_data());
    }
}
