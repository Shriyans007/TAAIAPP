# Authentication

The login endpoint calls `wp_authenticate`, so existing website username/password and email/password credentials work. It returns a revocable 30-day mobile token stored in Expo SecureStore. Logout deletes the session; expired or deleted sessions return 401. Passwords and bearer tokens must never be logged.

Live credential testing requires installing the plugin on a staging/production WordPress site and a non-administrator test customer supplied by TAAI. Never send that password in chat or commit it.

## Google authentication and account sync

Google authentication always maps to a real WordPress/WooCommerce user. It never creates a mobile-only account.

- **Existing WordPress users:** sign in once with the existing username/email and password, then open Profile → Account Settings → Link Google Account. Future Google logins resolve to that same WordPress user ID.
- **New Google sign-ups:** the verified Google email and name create a WordPress customer with a random server-generated password, then link the Google subject ID. If the email already belongs to WordPress, sign-up is blocked and the member must use the existing-password linking flow. This prevents duplicate customer and membership records.
- **Website access:** the account exists on the TAAI website immediately. A Google-created user can use WordPress Forgot Password to set a website password. A Google button on the website itself requires a separate website OAuth/SSO interface; the mobile plugin does not pretend one exists.

The app sends only the short-lived Google ID token over HTTPS. The WordPress plugin verifies its RS256 signature with Google's certificates and checks issuer, expiry, verified email and audience before issuing a normal revocable TAAI mobile session. Google client IDs are public identifiers; no Google client secret belongs in the app.

### Required Google Cloud configuration

Create OAuth 2.0 client IDs in TAAI's Google Cloud project for:

1. iOS bundle ID `au.net.taai.app`.
2. Android package `au.net.taai.app` plus the production signing certificate SHA-1.
3. Web development, if browser preview login is required.

Copy `.env.example` to `.env` and populate the three `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` values. These IDs are client-safe and bundled into the app; never add a client secret.

In WordPress, open **TAAI Mobile → Google Login**, add the same iOS, Android and optional web client IDs one per line, then select **Save Google Client IDs**. This requires WordPress administrator access but not server-file access.

Server administrators can instead define the IDs in `wp-config.php` above the “stop editing” line. This overrides the dashboard setting:

```php
define('TAAI_MOBILE_GOOGLE_CLIENT_IDS', 'ios-id.apps.googleusercontent.com,android-id.apps.googleusercontent.com,web-id.apps.googleusercontent.com');
```

Upload and activate TAAI Mobile API 1.6.0, then rebuild the native app because OAuth redirect configuration is native. Test sign-up, existing-account collision, authenticated linking, linked login and unlinked-login rejection using non-administrator test accounts.
