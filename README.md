# TAAI APP

Cross-platform Expo/React Native app for Telugu Association of Australia Inc. WordPress and WooCommerce remain the source of truth. One TypeScript codebase targets Android and iOS.

## Stack and architecture

Expo 54, Expo Router, TypeScript, TanStack Query, SecureStore, Expo Notifications, React Hook Form and Zod. `app/` contains routes, `components/` shared UI, `services/` integrations, `theme/` tokens extracted from the Figma prototype, and `wordpress-integration/taai-mobile-api/` the installable WordPress plugin.

## Local setup

Use Node 20 LTS. Copy `.env.example` to `.env`, fill only public configuration, then run `npm install` and `npm start`. Use `npm run android`, or `npm run ios` on macOS with Xcode. Run `npm run typecheck` before commits.

Never put WordPress passwords, WooCommerce keys, Application Passwords or tokens in Expo variables. `EXPO_PUBLIC_*` values are bundled into the app.

## WordPress setup

Install and activate `wordpress-integration/taai-mobile-api`. Activation creates session and push-token tables. Existing username/email plus existing WordPress password is checked server-side with `wp_authenticate`; the raw password is never saved. Install WooCommerce and WooCommerce Subscriptions for membership data. See `docs/WORDPRESS_SETUP.md`.

## Public integrations

Events use WooCommerce Store API category 112; membership products use category 81; purchases open the secure website checkout. Gallery and page content use WordPress REST. Raw responses are mapped to app types.

## Builds

Replace the placeholder EAS project ID, run `eas login`, `eas build:configure`, then `eas build --platform android --profile production` and `eas build --platform ios --profile production`. Expo Go is not required for release builds. Organisation-owned Apple and Google developer credentials are external requirements.

See `docs/RELEASE.md` for production and store steps and the remaining device-validation checklist.

