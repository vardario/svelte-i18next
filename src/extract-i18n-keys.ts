//@ts-expect-error
import { vitePreprocess } from '@sveltejs/kit/vite';
import * as acorn from 'acorn';
import { CallExpression, Node } from 'estree';
import _ from 'lodash';
import fs from 'node:fs/promises';
import path from 'node:path';
import * as compiler from 'svelte/compiler';
import { Ast } from 'svelte/types/compiler/interfaces';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess';
import { extractKeyPathFromFile, stripScriptTag } from './string-utils.js';
import { scanDir } from './utils.js';

function extractI18nKeys(ast: Ast | Node, callIdentifier: string): string[] {
  const result: string[] = [];

  compiler.walk(ast as Node, {
    enter: (node: any) => {
      if (node.type === 'CallExpression') {
        const callExpressionNode = node as CallExpression;
        const { callee } = callExpressionNode;
        if (callee.type === 'Identifier' && callee.name === callIdentifier) {
          const [arg] = node.arguments;
          if (arg.type === 'Literal' && arg.value) {
            result.push(arg.value);
          }
        }
      }

      if (node.type === 'InlineComponent') {
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
  const keys: string[] = [];

  const filename = path.relative(dirSvelteApp, file);
  const preprocessExtract = (): PreprocessorGroup => {
    return {
      async markup({ content, filename }) {
        const { code } = stripScriptTag(rawCode);
        const ast = compiler.parse(code);
        keys.push(...extractI18nKeys(ast, callIdentifier));
        return { code: content };
      },
      async script({ content, filename }) {
        const ast = acorn.parse(content, { ecmaVersion: 'latest', sourceType: 'module' }) as Node;
        keys.push(...extractI18nKeys(ast, callIdentifier));
        return { code: content };
      }
    };
  };

  await compiler.preprocess(rawCode, [vitePreprocess(), preprocessExtract()], { filename });

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
