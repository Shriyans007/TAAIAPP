<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Users {
    private const AVATAR_META_KEY = 'taai_mobile_avatar_id';
    private const AVATAR_ATTACHMENT_META_KEY = '_taai_mobile_profile_avatar';
    private const MAX_AVATAR_BYTES = 5242880;

    public static function profile(int $id): array {
        $u = get_userdata($id);
        $avatar_id = absint(get_user_meta($id, self::AVATAR_META_KEY, true));
        $avatar_url = $avatar_id ? wp_get_attachment_image_url($avatar_id, 'medium') : false;
        return ['id'=>$id,'username'=>$u->user_login,'email'=>$u->user_email,'firstName'=>$u->first_name,'lastName'=>$u->last_name,'displayName'=>$u->display_name,'avatarUrl'=>$avatar_url ?: null,'googleLinked'=>(bool)get_user_meta($id,'taai_mobile_google_sub',true),'phone'=>get_user_meta($id,'billing_phone',true),'billing'=>['address1'=>get_user_meta($id,'billing_address_1',true),'city'=>get_user_meta($id,'billing_city',true),'postcode'=>get_user_meta($id,'billing_postcode',true),'state'=>get_user_meta($id,'billing_state',true),'country'=>get_user_meta($id,'billing_country',true)]];
    }
    public static function me() { return self::profile(TAAI_Mobile_Security::user_id()); }
    public static function update(WP_REST_Request $r) {
        $id = TAAI_Mobile_Security::user_id();
        $user = get_userdata($id);
        if (!$user) return new WP_Error('taai_user_missing', 'Account could not be loaded.', ['status' => 404]);
        $data = ['ID' => $id];
        foreach (['firstName' => 'first_name', 'lastName' => 'last_name'] as $in => $out) {
            if ($r->has_param($in)) $data[$out] = sanitize_text_field($r[$in]);
        }
        if ($r->has_param('email')) {
            $email = sanitize_email($r['email']);
            if (!is_email($email)) return new WP_Error('taai_invalid_email', 'Enter a valid email address.', ['status' => 400]);
            if (strcasecmp($email, $user->user_email) !== 0) {
                if (!wp_check_password((string) $r['currentPassword'], $user->user_pass, $id)) return new WP_Error('taai_reauthentication_failed', 'Enter your current password to change your email.', ['status' => 401]);
                $data['user_email'] = $email;
            }
        }
        $result = wp_update_user($data);
        if (is_wp_error($result)) return $result;
        $map = ['phone' => 'billing_phone', 'address1' => 'billing_address_1', 'city' => 'billing_city', 'postcode' => 'billing_postcode', 'state' => 'billing_state', 'country' => 'billing_country'];
        foreach ($map as $in => $meta) if ($r->has_param($in)) update_user_meta($id, $meta, sanitize_text_field($r[$in]));
        if (isset($data['user_email'])) {
            TAAI_Mobile_Security::revoke_user_sessions($id);
        }
        return self::profile($id);
    }

    public static function upload_avatar(WP_REST_Request $request) {
        $id = TAAI_Mobile_Security::user_id();
        $files = $request->get_file_params();
        if (empty($files['avatar']) || !is_array($files['avatar'])) {
            return new WP_Error('taai_avatar_missing', 'Choose a profile photo to upload.', ['status' => 400]);
        }

        $file = $files['avatar'];
        if (!empty($file['error'])) return new WP_Error('taai_avatar_upload_failed', 'The profile photo could not be uploaded.', ['status' => 400]);
        if (empty($file['size']) || (int) $file['size'] > self::MAX_AVATAR_BYTES) {
            return new WP_Error('taai_avatar_too_large', 'Profile photos must be smaller than 5 MB.', ['status' => 400]);
        }

        $checked = wp_check_filetype_and_ext($file['tmp_name'], $file['name']);
        $allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (empty($checked['type']) || !in_array($checked['type'], $allowed, true)) {
            return new WP_Error('taai_avatar_type', 'Use a JPEG, PNG or WebP profile photo.', ['status' => 400]);
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';

        $_FILES['taai_mobile_avatar'] = $file;
        $attachment_id = media_handle_upload('taai_mobile_avatar', 0, ['post_title' => 'TAAI member profile photo'], ['test_form' => false]);
        unset($_FILES['taai_mobile_avatar']);
        if (is_wp_error($attachment_id)) return new WP_Error('taai_avatar_upload_failed', 'The profile photo could not be uploaded.', ['status' => 500]);

        wp_update_post(['ID' => $attachment_id, 'post_author' => $id, 'post_status' => 'private']);
        update_post_meta($attachment_id, self::AVATAR_ATTACHMENT_META_KEY, $id);
        $old_id = absint(get_user_meta($id, self::AVATAR_META_KEY, true));
        update_user_meta($id, self::AVATAR_META_KEY, $attachment_id);

        if ($old_id && $old_id !== $attachment_id && absint(get_post_meta($old_id, self::AVATAR_ATTACHMENT_META_KEY, true)) === $id) {
            wp_delete_attachment($old_id, true);
        }

        return rest_ensure_response(self::profile($id));
    }
}

