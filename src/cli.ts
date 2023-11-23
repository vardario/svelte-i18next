import _ from 'lodash';
import fs from 'node:fs';
import path from 'node:path';

import { extractI18NextKeys } from './extract-i18n-keys.js';
import { parseCsv, recordsToCsv } from './csv-utils.js';

export const TODO_STRING = 'xxxTODOxxx';

export interface SynchroniesParams {
  dirs: string[];
  languages: string[];
  output: string;
}

export async function synchronies(params: SynchroniesParams) {
  const keys = await extractI18NextKeys(params.dirs);

  for (const language of params.languages) {
    const languageFile = path.resolve(params.output, language) + '.csv';
    if (!fs.existsSync(languageFile)) {
      const translations = keys.reduce(
        (acc, key) => {
          acc[key] = TODO_STRING;
          return acc;
        },
        {} as Record<string, string>
      );

      fs.writeFileSync(languageFile, recordsToCsv(translations));
    } else {
      const csv = fs.readFileSync(languageFile).toString('utf-8');
      const diffResult = diffLanguageFile({ keys, languageFile: csv });
      if (diffResult.inSync === false) {
        const translations = parseCsv(csv);

        diffResult.removed.forEach(removed => {
          delete translations[removed];
        });

        diffResult.added.forEach(added => {
          translations[added] = TODO_STRING;
        });

        fs.writeFileSync(languageFile, recordsToCsv(translations));
      }
    }
  }
}

export interface DiffProps {
  keys: string[];
  languageFile: string;
}

export function diffLanguageFile(params: DiffProps) {
  const translations = parseCsv(params.languageFile);
  const translationKeys = _.keys(translations);

  const added = _.difference(params.keys, translationKeys);
  const removed = _.difference(translationKeys, params.keys);
  const inSync = added.length === 0 && removed.length === 0;

  return {
    added,
    removed,
    inSync
  };
}

export async function isInSync(params: SynchroniesParams) {
  const keys = await extractI18NextKeys(params.dirs);
  let result = true;

  for (const language of params.languages) {
    const languageFile = path.resolve(params.output, language) + '.csv';
    if (!fs.existsSync(languageFile)) {
      console.error(`${languageFile} does not exist`);
      return false;
    }

    const csv = fs.readFileSync(languageFile).toString('utf-8');
    const { inSync, added, removed } = diffLanguageFile({
      keys,
      languageFile: csv
    });

    if (inSync === false) {
      console.error(`${languageFile} is not in sync!`);
      console.error('adds', JSON.stringify(added, null, 2));
      console.error('removals', JSON.stringify(removed, null, 2));
      result = false;
    }
  }

  return result;
}
