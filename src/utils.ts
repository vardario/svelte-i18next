import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

import _ from 'lodash';
import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';

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

export function stripScriptTag(code: string) {
  const scriptTagRegEx = /<.*?script.*?>(.*?)<\/.*?script.*?>/gi;
  const scriptTags: string[] = [];

  for (const match of code.matchAll(scriptTagRegEx)) {
    scriptTags.push(match[0]);
  }

  return { code: code.replace(scriptTagRegEx, ''), scriptTags };
}

export function __dirname(meta: ImportMeta) {
  const __filename = url.fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}

export function extractKeyPathFromFile(filename: string) {
  filename = filename.split('.').slice(0, -1).join('.');
  const regEx = /(components|routes)/;
  const match = regEx.exec(filename);
  if (match === null) {
    throw new Error(`${filename} is not valid.`);
  }

  const pathParts = filename.split(path.sep);
  const index = pathParts.findIndex(pathPart => regEx.exec(pathPart));

  const result = pathParts.slice(index).join('.');
  return result.replace('.svelte', '').replace('+', '');
}

export function parseCsv(csv: string): Record<string, string> {
  const items = parse(csv, {
    delimiter: ';',
    trim: true,
    bom: true
  }) as string[][];

  return items.reduce((acc, item) => {
    if (item.length === 2) {
      acc[item[0]] = item[1];
    }

    return acc;
  }, {} as Record<string, string>);
}

export function recordsToCsv(items: Record<string, string>) {
  const keys = _.keys(items);
  const values = _.values(items);
  const csv = keys.reduce((acc, key, index) => {
    acc.push([key, values[index]]);
    return acc;
  }, [] as string[][]);

  return stringify(
    csv.sort((a, b) => a[0].localeCompare(b[0])),
    {
      bom: true,
      delimiter: ';'
    }
  );
}
