# Authentication

The login endpoint calls `wp_authenticate`, so existing website username/password and email/password credentials work. It returns a revocable 30-day mobile token stored in Expo SecureStore. Logout deletes the session; expired or deleted sessions return 401. Passwords and bearer tokens must never be logged.

Live credential testing requires installing the plugin on a staging/production WordPress site and a non-administrator test customer supplied by TAAI. Never send that password in chat or commit it.

