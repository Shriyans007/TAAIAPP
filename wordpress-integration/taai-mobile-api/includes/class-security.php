<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Security {
    public static function activate(): void {
        global $wpdb; require_once ABSPATH . 'wp-admin/includes/upgrade.php'; $c = $wpdb->get_charset_collate();
        dbDelta("CREATE TABLE {$wpdb->prefix}taai_mobile_sessions (id bigint unsigned NOT NULL AUTO_INCREMENT,user_id bigint unsigned NOT NULL,token_hash char(64) NOT NULL,expires_at datetime NOT NULL,created_at datetime NOT NULL,last_used_at datetime NULL,PRIMARY KEY(id),UNIQUE KEY token_hash(token_hash),KEY user_id(user_id)) $c;");
        dbDelta("CREATE TABLE {$wpdb->prefix}taai_mobile_push_tokens (id bigint unsigned NOT NULL AUTO_INCREMENT,user_id bigint unsigned NULL,token varchar(255) NOT NULL,preferences longtext NULL,updated_at datetime NOT NULL,PRIMARY KEY(id),UNIQUE KEY token(token),KEY user_id(user_id)) $c;");
    }
    public static function bearer(): string { $h = $_SERVER['HTTP_AUTHORIZATION'] ?? ''; return preg_match('/^Bearer\s+(.+)$/i', $h, $m) ? trim($m[1]) : ''; }
    public static function user_id() {
        global $wpdb; $token = self::bearer();
        if (!$token) return new WP_Error('taai_unauthorized', 'Authentication required.', ['status' => 401]);
        $row = $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->prefix}taai_mobile_sessions WHERE token_hash=%s", hash('sha256', $token)));
        if (!$row || strtotime($row->expires_at) < time()) return new WP_Error('taai_session_expired', 'Your session has expired.', ['status' => 401]);
        $wpdb->update("{$wpdb->prefix}taai_mobile_sessions", ['last_used_at' => current_time('mysql', true)], ['id' => $row->id]); return (int) $row->user_id;
    }
    public static function permission(): bool { return is_int(self::user_id()); }
    public static function rate_limit(string $key, int $max = 10): bool { $ip = sanitize_text_field($_SERVER['REMOTE_ADDR'] ?? 'unknown'); $k = 'taai_rate_' . md5($key . $ip); $n = (int) get_transient($k); set_transient($k, $n + 1, MINUTE_IN_SECONDS); return $n < $max; }
}

