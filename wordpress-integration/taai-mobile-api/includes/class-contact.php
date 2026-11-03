<?php
defined('ABSPATH') || exit;

final class TAAI_Mobile_Contact {
    public static function send(WP_REST_Request $request) {
        $name = sanitize_text_field((string) $request->get_param('name'));
        $email = sanitize_email((string) $request->get_param('email'));
        $message = sanitize_textarea_field((string) $request->get_param('message'));

        if (!$name || strlen($name) > 120 || !is_email($email) || !$message || strlen($message) > 5000) {
            return new WP_Error('taai_invalid_contact', 'Enter a name, valid email and message (up to 5000 characters).', ['status' => 400]);
        }
        if (!TAAI_Mobile_Security::rate_limit('contact', 3) ||
            !TAAI_Mobile_Security::account_rate_limit('contact', $email, 3)) {
            return new WP_Error('taai_rate_limited', 'Please wait before sending another message.', ['status' => 429]);
        }

        $recipient = 'secretary@taai.net.au';
        $subject = 'TAAI app contact message';
        $body = "Name: {$name}\nEmail: {$email}\n\n{$message}";
        $headers = ['Reply-To: ' . $name . ' <' . $email . '>'];
        if (!wp_mail($recipient, $subject, $body, $headers)) {
            return new WP_Error('taai_contact_failed', 'Message could not be sent. Please try again later.', ['status' => 503]);
        }
        return ['success' => true];
    }
}
