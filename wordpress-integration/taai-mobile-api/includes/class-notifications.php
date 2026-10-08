<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Notifications {
    public static function admin_menu(): void { add_menu_page('TAAI Mobile','TAAI Mobile','manage_options','taai-mobile',[self::class,'page'],'dashicons-smartphone'); }
    public static function page(): void {
        if (!current_user_can('manage_options')) wp_die('Forbidden');
        $notice = '';
        if (isset($_POST['taai_send'])) {
            check_admin_referer('taai_send_notification');
            $audience = sanitize_key($_POST['audience'] ?? 'everyone');
            $category = sanitize_key($_POST['category'] ?? 'community');
            if (!in_array($audience, ['everyone', 'members'], true) || !in_array($category, ['events', 'community', 'membership'], true)) {
                $notice = '<div class="notice notice-error"><p>Choose a valid audience and notification category.</p></div>';
            } else {
                self::send(sanitize_text_field($_POST['title'] ?? ''), sanitize_textarea_field($_POST['message'] ?? ''), $audience, $category);
                $notice = '<div class="notice notice-success"><p>Notification request sent to opted-in devices.</p></div>';
            }
        }
        echo '<div class="wrap"><h1>TAAI Mobile Notifications</h1>' . wp_kses_post($notice) . '<form method="post">';
        wp_nonce_field('taai_send_notification');
        echo '<p><input required maxlength="100" class="regular-text" name="title" placeholder="Title"></p>';
        echo '<p><textarea required maxlength="500" class="large-text" name="message" placeholder="Message"></textarea></p>';
        echo '<p><label>Category <select name="category"><option value="events">Events</option><option value="community">Community Updates</option><option value="membership">Membership Reminders</option></select></label></p>';
        echo '<p><label>Audience <select name="audience"><option value="everyone">Everyone</option><option value="members">Members only</option></select></label></p>';
        echo '<button class="button button-primary" name="taai_send">Send Notification</button></form></div>';
    }

    private static function send(string $title, string $message, string $audience, string $category): void {
        global $wpdb;
        if (!$title || !$message) return;
        $rows = $wpdb->get_results("SELECT token,user_id,preferences FROM {$wpdb->prefix}taai_mobile_push_tokens ORDER BY id ASC");
        $messages = [];
        foreach ($rows as $row) {
            if ($audience === 'members' && !self::is_member((int) $row->user_id)) continue;
            $preferences = json_decode((string) $row->preferences, true);
            if (is_array($preferences) && array_key_exists($category, $preferences) && !$preferences[$category]) continue;
            $messages[] = ['to' => $row->token, 'sound' => 'default', 'title' => $title, 'body' => $message, 'data' => ['category' => $category]];
        }
        foreach (array_chunk($messages, 100) as $batch) {
            $response = wp_remote_post('https://exp.host/--/api/v2/push/send', ['headers' => ['Content-Type' => 'application/json'], 'body' => wp_json_encode($batch), 'timeout' => 20]);
            if (is_wp_error($response)) continue;
            $payload = json_decode((string) wp_remote_retrieve_body($response), true);
            $tickets = isset($payload['data']) && is_array($payload['data']) ? $payload['data'] : [];
            foreach ($tickets as $index => $ticket) {
                if (($ticket['details']['error'] ?? '') === 'DeviceNotRegistered' && isset($batch[$index]['to'])) {
                    $wpdb->delete("{$wpdb->prefix}taai_mobile_push_tokens", ['token' => $batch[$index]['to']], ['%s']);
                }
            }
        }
    }
    private static function is_member(int $id): bool { return function_exists('wcs_user_has_subscription') && wcs_user_has_subscription($id,'','active'); }
}

