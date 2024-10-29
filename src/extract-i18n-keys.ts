import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import * as acorn from 'acorn';
import { CallExpression, Node } from 'estree';
import _ from 'lodash';
import fs from 'node:fs/promises';
import path from 'node:path';
import { walk } from 'estree-walker';
import { extractKeyPathFromFile } from './string-utils.js';
import { scanDir } from './utils.js';
import { preprocess, PreprocessorGroup, parse } from 'svelte/compiler';
import printAst from '@vardario/svelte-ast-printer';

function extractI18nKeys(root: any, callIdentifier: string): string[] {
  const result: string[] = [];

  walk(root, {
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

      if (node.type === 'Component') {
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
        const ast = parse(content, { modern: true });
        keys.push(...extractI18nKeys(ast.fragment, callIdentifier));
        if (ast.instance) {
          keys.push(...extractI18nKeys(ast.instance.content, callIdentifier));
        }

        if (ast.module) {
          keys.push(...extractI18nKeys(ast.module.content, callIdentifier));
        }

        return { code: printAst(ast) };
      }
    };
  };

  await preprocess(rawCode, [vitePreprocess(), preprocessExtract()], { filename });

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
