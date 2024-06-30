import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { addPrefixToI18nArgument, extractKeyPathFromFile, stripScriptTag } from '../string-utils.js';
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

  test('stripScriptTag', () => {
    const result0 = stripScriptTag('<script lang="ts">let a;</script><main/>');
    const result1 = stripScriptTag('<script>let a;</script><main/>');
    const result2 = stripScriptTag('<script lang="ts">let a;</script><script context="module">let a;</script><main/>');

    expect(result0.code).toBe('<main/>');
    expect(result0.scriptTags).toStrictEqual(['<script lang="ts">let a;</script>']);

    expect(result1.code).toBe('<main/>');
    expect(result1.scriptTags).toStrictEqual(['<script>let a;</script>']);

    expect(result2.code).toBe('<main/>');
    expect(result2.scriptTags).toStrictEqual([
      '<script lang="ts">let a;</script>',
      '<script context="module">let a;</script>'
    ]);
  });

  test('addPrefixToI18nArgument', () => {
    expect(addPrefixToI18nArgument("const a = $i18n('key')", 'prefix')).toBe("const a = $i18n('prefix.key')");
    expect(addPrefixToI18nArgument("const a = $i18n('key', { count: 1 })", 'prefix')).toBe(
      "const a = $i18n('prefix.key', { count: 1 })"
    );
  });
});
