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

    expect(auth).toContain("query.meta?.authRequired === true");
    expect(directory).toContain("queryKey: ['member-directory', user?.id]");
    expect(membership).toContain("queryKey: ['membership', user?.id]");
  });

  test('notification broadcasts apply stored preferences', () => {
    const notifications = source(
      'wordpress-integration/taai-mobile-api/includes/class-notifications.php',
    );

    expect(notifications).toContain('SELECT token,user_id,preferences');
    expect(notifications).toContain("array_key_exists($category, $preferences)");
    expect(notifications).toContain('DeviceNotRegistered');
  });
});
