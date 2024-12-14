import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import prettier from 'prettier';
import prettierPluginSvelte from 'prettier-plugin-svelte';

export async function scanDir(dir: string, filter?: (file: string) => boolean) {
  const result: string[] = [];

  const _scanDir = async (dir: string, filer?: (file: string) => boolean) => {
    const dirEntries = await fs.readdir(dir);

    for (const dirEntry of dirEntries) {
      const fullDirEntry = path.resolve(dir, dirEntry);
      const stat = await fs.stat(fullDirEntry);

      if (stat.isDirectory()) {
        await _scanDir(fullDirEntry);
      } else {
        (!filter || filter(fullDirEntry)) && result.push(fullDirEntry);
      }
    }
  };

  await _scanDir(dir, filter);

  return result.sort();
}

export function __dirname(meta: ImportMeta) {
  const __filename = url.fileURLToPath(meta.url);
  return path.dirname(__filename);
}

export async function formatSvelte(code: string) {
  return prettier.format(code, {
    parser: 'svelte',
    plugins: [prettierPluginSvelte]
  });
}
