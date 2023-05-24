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
        'translation.components.auth.firstName',
        'translation.components.auth.lastName',
        'translation.components.auth.password',
        'translation.components.user-form.firstName',
        'translation.components.user-form.lastName',
        'translation.routes.about.page.intro',
        'translation.routes.layout.header',
        'translation.routes.page.intro',
        'translation.routes.page.known-from',
        'translation.routes.team.page.team-intro'
      ].sort()
    );
  });
});
