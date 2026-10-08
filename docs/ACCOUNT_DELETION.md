# Account deletion

The mobile endpoint requires the current WordPress password, blocks administrator accounts, revokes mobile sessions, removes notification tokens, anonymises supported WordPress/WooCommerce profile fields, and stores the `taai_mobile_deleted` marker.

Plugin version 1.3.0 enforces that marker through the WordPress-wide `wp_authenticate_user` filter. Deleted accounts therefore cannot log in through either the mobile API or the normal WordPress/WooCommerce login form. Historical WooCommerce orders and accounting records remain retained where required.

TAAI administrators should document the legally required retention period and process manual requests involving data stored by third-party WordPress plugins that are not covered by the plugin's explicit anonymisation list. TAAI must review this retention behaviour with its privacy/legal adviser before release.
