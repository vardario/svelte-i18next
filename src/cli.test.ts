import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { diffLanguageFile, isInSync } from './cli.js';
import { __dirname } from './utils.js';

describe('cli', () => {
  test('isInSync', async () => {
    const dir = path.resolve(__dirname(import.meta), '../assets/example');
    const output = path.resolve(__dirname(import.meta), '../assets/translations');

    expect(
      await isInSync({
        dirs: [dir],
        languages: ['de', 'en'],
        output
      })
    ).toBe(true);
  });

  test('diffLanguageFile', () => {
    expect(
      diffLanguageFile({
        keys: ['a'],
        languageFile: 'a;Hello,World'
      })
    ).toEqual({
      inSync: true,
      added: [],
      removed: []
    });

    expect(
      diffLanguageFile({
        keys: ['a'],
        languageFile: ''
      })
    ).toEqual({
      inSync: false,
      added: ['a'],
      removed: []
    });

    expect(
      diffLanguageFile({
        keys: ['a', 'b'],
        languageFile: 'a;Hello,World'
      })
    ).toEqual({
      inSync: false,
      added: ['b'],
      removed: []
    });

    expect(
      diffLanguageFile({
        keys: ['a'],
        languageFile: 'a;Hello,World\nb;Hello,Local'
      })
    ).toEqual({
      inSync: false,
      added: [],
      removed: ['b']
    });
  });
});
