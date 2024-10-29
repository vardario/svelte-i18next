import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { addPrefixToI18nArgument, extractKeyPathFromFile } from '../string-utils.js';
import { __dirname } from '../utils.js';

describe('string-utils', () => {
  test('extractPrefixFromFile', () => {
    const assetDir = path.resolve(__dirname(import.meta), './assets');
    expect(extractKeyPathFromFile(path.resolve(assetDir, 'example/components/auth.svelte'))).toBe('components.auth');
    expect(extractKeyPathFromFile(path.resolve(assetDir, 'example/components/sub-component/auth.svelte'))).toBe(
      'components.sub-component.auth'
    );
    expect(extractKeyPathFromFile(path.resolve(assetDir, 'example/routes/+page.svelte'))).toBe('routes.page');
    expect(extractKeyPathFromFile(path.resolve(assetDir, 'example/routes/+layout.svelte'))).toBe('routes.layout');
    expect(extractKeyPathFromFile(path.resolve(assetDir, 'example/routes/about/+page.svelte'))).toBe(
      'routes.about.page'
    );
  });

  test('addPrefixToI18nArgument', () => {
    expect(addPrefixToI18nArgument("const a = $i18n('key')", 'prefix')).toBe("const a = $i18n('prefix.key')");
    expect(addPrefixToI18nArgument("const a = $i18n('key', { count: 1 })", 'prefix')).toBe(
      "const a = $i18n('prefix.key', { count: 1 })"
    );
  });
});
