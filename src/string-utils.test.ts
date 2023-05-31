import { describe, expect, test } from 'vitest';
import { extractKeyPathFromFile, stripScriptTag } from './string-utils.js';

describe('string-utils', () => {
  test('extractPrefixFromFile', () => {
    expect(extractKeyPathFromFile('example/components/auth.svelte')).toBe('components.auth');
    expect(extractKeyPathFromFile('example/components/sub-component/auth.svelte')).toBe(
      'components.sub-component.auth'
    );
    expect(extractKeyPathFromFile('example/routes/+page.svelte')).toBe('routes.page');
    expect(extractKeyPathFromFile('example/routes/+layout.svelte')).toBe('routes.layout');
    expect(extractKeyPathFromFile('example/routes/about/+page.svelte')).toBe('routes.about.page');
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
});
