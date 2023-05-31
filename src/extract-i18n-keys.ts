import _ from 'lodash';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as compiler from 'svelte/compiler';
import { Ast } from 'svelte/types/compiler/interfaces.js';
import { extractKeyPathFromFile, stripScriptTag } from './string-utils.js';
import { scanDir } from './utils.js';

function extractKeysFromComponent(ast: Ast, callIdentifier: string): string[] {
  const result: string[] = [];

  compiler.walk(ast.html, {
    enter: (node: any) => {
      if (
        node.type === 'CallExpression' &&
        node.callee &&
        node.callee.type === 'Identifier' &&
        node.callee.name === callIdentifier
      ) {
        const [firstArgument] = node.arguments.length > 0 && node.arguments;
        if (firstArgument && firstArgument.type === 'Literal') {
          result.push(firstArgument.value);
        }
      }

      if (node.type === 'InlineComponent' && node.name === 'Input') {
        const nameAttribute = node.attributes?.find((attr: any) => attr.name === 'name');
        if (nameAttribute) {
          result.push(nameAttribute.value[0].data);
        }
      }
    }
  });

  return result;
}

export async function processSvelteFile(
  file: string,
  dirSvelteApp: string,
  callIdentifier: string = '$i18n'
): Promise<string[]> {
  let rawCode = (await fs.readFile(file)).toString('utf-8');
  const { code } = stripScriptTag(rawCode);

  const filename = path.relative(dirSvelteApp, file);
  const ast = compiler.parse(code);
  const keys = extractKeysFromComponent(ast, callIdentifier);

  const addKeyPath = (key: string) => {
    const path = extractKeyPathFromFile(filename);
    return `${path}.${key}`;
  };

  return keys.map(addKeyPath);
}

export async function extractI18NextKeys(dirSvelteApps: string[]) {
  const svelteRegEx = /^.*\.svelte/;

  const result: string[] = [];

  for (const appDir of dirSvelteApps) {
    const files = await scanDir(appDir, file => svelteRegEx.exec(file) !== null && file.search('node_modules') === -1);
    const appResult = _.flatMap(await Promise.all(files.map(async file => await processSvelteFile(file, appDir))));
    result.push(...appResult);
  }

  return result.map(key => `${key}`).sort();
}
