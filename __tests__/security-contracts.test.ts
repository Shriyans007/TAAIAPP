import fs from 'node:fs';
import path from 'node:path';

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('security contracts', () => {
  test('password changes revoke custom mobile sessions', () => {
    const plugin = source('wordpress-integration/taai-mobile-api/taai-mobile-api.php');
    const security = source('wordpress-integration/taai-mobile-api/includes/class-security.php');

    expect(plugin).toContain("add_action('after_password_reset'");
    expect(plugin).toContain("add_action('profile_update'");
    expect(security).toContain('revoke_user_sessions');
    expect(security).toContain('MAX_ACTIVE_SESSIONS');
  });

  test('deleted accounts are blocked across WordPress authentication', () => {
    const plugin = source('wordpress-integration/taai-mobile-api/taai-mobile-api.php');
    const security = source('wordpress-integration/taai-mobile-api/includes/class-security.php');

    expect(plugin).toContain("add_filter('wp_authenticate_user'");
    expect(security).toContain("get_user_meta($user->ID, 'taai_mobile_deleted'");
  });

  test('protected client queries are user scoped and cleared on logout', () => {
    const auth = source('services/auth/AuthProvider.tsx');
    const directory = source('app/(tabs)/directory.tsx');
    const membership = source('app/(tabs)/membership.tsx');

    expect(auth).toContain('query.meta?.authRequired === true');
    expect(directory).toContain("queryKey: ['member-directory', user?.id]");
    expect(membership).toContain("queryKey: ['membership', user?.id]");
  });

  test('notification broadcasts apply stored preferences', () => {
    const notifications = source(
      'wordpress-integration/taai-mobile-api/includes/class-notifications.php',
    );

    expect(notifications).toContain('SELECT token,user_id,preferences');
    expect(notifications).toContain('array_key_exists($category, $preferences)');
    expect(notifications).toContain('DeviceNotRegistered');
  });

  test('events use the WooCommerce event category slug', () => {
    const events = source('wordpress-integration/taai-mobile-api/includes/class-events.php');

    expect(events).toContain("CATEGORY_SLUG = 'taaievents'");
    expect(events).toContain("'status' => 'publish'");
    expect(events).toContain("'category' => [self::CATEGORY_SLUG]");
  });

  test('profile photos are authenticated, validated and kept out of the public gallery', () => {
    const users = source('wordpress-integration/taai-mobile-api/includes/class-users.php');
    const routes = source('wordpress-integration/taai-mobile-api/includes/class-rest-api.php');

    expect(routes).toContain("'/profile/avatar'");
    expect(routes).toContain(
      "'permission_callback' => [TAAI_Mobile_Security::class, 'permission']",
    );
    expect(users).toContain('MAX_AVATAR_BYTES');
    expect(users).toContain("['image/jpeg', 'image/png', 'image/webp']");
    expect(users).toContain("'post_status' => 'private'");
  });

  test('event galleries only expose curated published albums', () => {
    const gallery = source('wordpress-integration/taai-mobile-api/includes/class-gallery.php');

    expect(gallery).toContain("POST_TYPE = 'taai_gallery_album'");
    expect(gallery).toContain("'post_status' => 'publish'");
    expect(gallery).toContain("'_taai_mobile_profile_avatar'");
    expect(gallery).toContain("'photos' => $photos");
  });

  test('Google auth verifies tokens server-side and maps them to WordPress users', () => {
    const google = source('wordpress-integration/taai-mobile-api/includes/class-google-auth.php');
    const routes = source('wordpress-integration/taai-mobile-api/includes/class-rest-api.php');

    expect(routes).toContain("'google/login'");
    expect(routes).toContain("'google/register'");
    expect(routes).toContain("'google/link'");
    expect(google).toContain('openssl_verify');
    expect(google).toContain('TAAI_MOBILE_GOOGLE_CLIENT_IDS');
    expect(google).toContain("'email_verified'");
    expect(google).toContain("'taai_mobile_google_sub'");
    expect(google).toContain("get_user_by('email'");
    expect(google).toContain("'role' => 'customer'");
  });
});
