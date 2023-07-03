import path from 'node:path';
import url from 'node:url';
import { describe, expect, test } from 'vitest';
import { extractI18NextKeys } from './extract-i18n-keys';

describe('extract-i18n-keys', () => {
  test('scan folder', async () => {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
    const exampleDir = path.resolve(__dirname, '../assets/example');

    const keys = await extractI18NextKeys([exampleDir]);

    expect(keys.sort()).toStrictEqual(
      [
        'components.auth.firstName',
        'components.auth.lastName',
        'components.auth.password',
        'components.user-form.amenities',
        'components.user-form.countryCode',
        'components.user-form.firstName',
        'components.user-form.lastName',
        'components.user-form.text',
        'routes.about.page.intro',
        'routes.layout.header',
        'routes.page.intro',
        'routes.page.item0',
        'routes.page.item1',
        'routes.page.known-from',
        'routes.page.title',
        'routes.team.page.team-intro',
        'routes.users.userId.page.user-message'
      ].sort()
    );
  });
});
