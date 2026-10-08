# Security hardening release 1.3.0

This release addresses the source-level security concerns identified in the October 2026 audit.

## WordPress plugin changes

- Password reset and WordPress password changes revoke every custom mobile session for that user.
- A user can keep at most five active mobile sessions. Expired sessions are removed during new session issuance.
- Login, registration, password recovery, push-token registration, and account-deletion confirmation have layered request limits.
- Changing the account email requires the current WordPress password and revokes existing mobile sessions.
- Deleted accounts are denied by the WordPress-wide `wp_authenticate_user` filter as well as the mobile login endpoint.
- Account anonymisation covers additional WooCommerce billing and shipping identity fields.
- Each account can register no more than five notification devices.
- Push tokens cannot be silently reassigned between users.
- Administrator notification sends require a valid category and respect stored user preferences.
- Expo `DeviceNotRegistered` responses remove dead tokens.

## Mobile app changes

- Membership and member-directory queries are keyed by WordPress user ID.
- All authenticated query data is removed at login/account switch and logout.
- Logout unregisters all push tokens belonging to the current account before revoking the session.
- Email changes ask for the current password and return the user to login because the server revokes existing sessions.

## WordPress deployment

1. Back up the WordPress database and current `taai-mobile-api` plugin folder.
2. Replace the installed plugin with the `wordpress-integration/taai-mobile-api` folder from this release.
3. Confirm the plugin header reports version `1.3.0`.
4. Deactivate and reactivate the plugin only if the custom tables were never created. This release does not require a schema migration.
5. Use a dedicated non-production customer to test login, password reset, profile email change, logout, account deletion, notification preferences, and deleted-account website login.
6. Do not test password recovery or notifications with real members.

## Remaining infrastructure checks

Source code cannot verify reverse-proxy client IP handling, WAF rules, SMTP quotas, Expo credentials, EAS signing controls, database backups, or cleanup jobs. Administrators must review these separately before production release.
