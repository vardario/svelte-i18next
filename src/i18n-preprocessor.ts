import printHtml, { PrinterIdentOptions } from '@vardario/svelte-ast-printer';
import { parse } from 'acorn';
import { CallExpression, Node } from 'estree';
import * as compiler from 'svelte/compiler';
import { Ast, TemplateNode } from 'svelte/types/compiler/interfaces';
import type { PreprocessorGroup } from 'svelte/types/compiler/preprocess';
import { extractKeyPathFromFile, stripScriptTag } from './utils.js';

export function create18nCallLabelAttribute(callIdentifier: string, i18nKey: string) {
  const expression = parse(`${callIdentifier}("${i18nKey}")`, { ecmaVersion: 'latest' });
  let callExpression;

  compiler.walk(expression, {
    enter: function (node: Node) {
      if (node.type === 'CallExpression') {
        callExpression = node;
      }
    }
  });

  return {
    type: 'Attribute',
    name: 'label',
    value: [
      {
        type: 'MustacheTag',
        expression: callExpression
      }
    ]
  };
}

export function adjustI18nCall(ast: Ast, prefix: string, callIdentifier: string = '$i18n') {
  compiler.walk(ast, {
    enter: function (node: Node) {
      if (node.type === 'CallExpression') {
        const callExpressionNode = node as CallExpression;
        const { callee } = callExpressionNode;
        if (callee.type === 'Identifier' && callee.name === callIdentifier) {
          const [arg] = node.arguments;
          if (arg.type === 'Literal' && arg.value) {
            arg.value = arg.raw = `"${prefix}.${arg.value}"`;
          }
        }
      }
    }
  });
}

export function adjustInputElementLabels(ast: Ast, prefix: string, callIdentifier: string = '$i18n') {
  compiler.walk(ast.html, {
    enter: (node: TemplateNode) => {
      if (node.type === 'InlineComponent' && node.name === 'Input') {
        const nameAttribute = node.attributes?.find((attr: any) => attr.name === 'name');
        const labelAttribute = node.attributes?.find((attr: any) => attr.name === 'label');

        if (nameAttribute) {
          const nameAttributeValue = nameAttribute.value[0].data;
          if (!labelAttribute) {
            node.attributes?.push(create18nCallLabelAttribute(callIdentifier, `${prefix}.${nameAttributeValue}`));
          }
        }
      }
    }
  });
}

export function adjustI18nKeys(ast: Ast, prefix: string, callIdentifier: string = '$i18n'): string[] {
  const result: string[] = [];

  adjustI18nCall(ast, prefix, callIdentifier);
  adjustInputElementLabels(ast, prefix, callIdentifier);

  return result;
}

export interface I18nProcessorOptions {
  /**
   * @default '$i18n'
   */
  callIdentifier?: string;

  /**
   *
   */
  indent?: PrinterIdentOptions;
}

export const i18nProcessor = (options?: I18nProcessorOptions): PreprocessorGroup => {
  const callIdentifier = options?.callIdentifier ?? '$i18n';
  return {
    async markup({ content, filename }) {
      if (/node_modules/g.exec(filename ?? '') !== null) {
        return {
          code: content
        };
      }

      const match = /(components\/|routes\/)/g.exec(filename ?? '');
      if (match !== null) {
        const { code, scriptTags } = stripScriptTag(content);
        const ast = compiler.parse(code);
        const keyPath = extractKeyPathFromFile(filename ?? '');

        adjustI18nKeys(ast, keyPath, callIdentifier);

        const transformedCode = printHtml({ ast, indent: options?.indent });
        const result = `${scriptTags.join('\n')}${scriptTags.length ? '\n' : ''}${transformedCode}`;
        return { code: result };
      }
      return {
        code: content
      };
    }
  };
};
