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
        'components.user-form.firstName',
        'components.user-form.lastName',
        'routes.about.page.intro',
        'routes.layout.header',
        'routes.page.intro',
        'routes.page.known-from',
        'routes.team.page.team-intro'
      ].sort()
    );
  });
});
