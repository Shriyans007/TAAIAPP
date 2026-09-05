# WordPress setup

Zip the `taai-mobile-api` folder, upload it at Plugins → Add New → Upload Plugin, activate it, and test on staging first. Keep HTTPS active. Confirm WooCommerce Subscriptions is enabled, WordPress registration policy is correct, outbound email works, and the REST endpoints are reachable. Restrict WordPress admin access; ordinary users cannot access TAAI Mobile administration.

The plugin supports the TAAI server's current PHP 7.4 runtime. Upgrading the server to a currently supported PHP release should still be planned because PHP 7.4 no longer receives upstream security fixes.

No Application Password is required by the app. Production should add infrastructure-level rate limiting and database backups alongside the plugin safeguards.
