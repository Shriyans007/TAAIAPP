# WordPress setup

Zip the `taai-mobile-api` folder, upload it at Plugins → Add New → Upload Plugin, activate it, and test on staging first. Keep HTTPS active. Confirm WooCommerce Subscriptions is enabled, WordPress registration policy is correct, outbound email works, and the REST endpoints are reachable. Restrict WordPress admin access; ordinary users cannot access TAAI Mobile administration.

The plugin supports the TAAI server's current PHP 7.4 runtime. Upgrading the server to a currently supported PHP release should still be planned because PHP 7.4 no longer receives upstream security fixes.

No Application Password is required by the app. Production should add infrastructure-level rate limiting and database backups alongside the plugin safeguards.

For Google account linking and sign-up, configure the allowed Google OAuth client IDs as described in `docs/AUTHENTICATION.md`. These are public client identifiers, not client secrets. The same Google-created customer appears in WordPress Users and WooCommerce Customers because WordPress remains the only account database.

## Event galleries

The mobile app gallery is separate from the website's existing general gallery. Event albums are managed under **WordPress Dashboard → TAAI Mobile → Event Galleries**.

To add a folder for a future event:

1. Open **TAAI Mobile → Event Galleries → Add Event Gallery**.
2. Enter the event name as the title, for example `TAAI Abhinandanamala 2026`.
3. In **Album Photos**, select **Select / Upload Photos**.
4. Upload new photos or select existing WordPress Media Library images.
5. Select the photos in the preferred order. The first selected photo becomes the album cover.
6. Select **Publish**.

Published albums appear automatically in the app as `Gallery → Event Name`. **All Photos** is generated automatically from every published event album. Editing an album or adding photos updates the app on its next refresh; no app-store release is required. Use **Draft** for albums that should not yet appear. Deleting an album removes the folder from the app but does not delete its Media Library images.

Member profile photos are stored as private, user-linked WordPress attachments. They are excluded from event albums and the public app gallery. Replacing a profile photo deletes the previous profile-photo attachment, and account deletion removes the current one.
