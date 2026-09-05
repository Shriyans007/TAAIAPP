# WordPress setup

Zip the `taai-mobile-api` folder, upload it at Plugins → Add New → Upload Plugin, activate it, and test on staging first. Keep HTTPS active. Confirm WooCommerce Subscriptions is enabled, WordPress registration policy is correct, outbound email works, and the REST endpoints are reachable. Restrict WordPress admin access; ordinary users cannot access TAAI Mobile administration.

No Application Password is required by the app. Production should add infrastructure-level rate limiting and database backups alongside the plugin safeguards.

