import { PrinterIdentOptions } from '@vardario/svelte-ast-printer';
import { parse as scriptParse } from 'acorn';
import { CallExpression, Node } from 'estree';
import { walk } from 'estree-walker';
import { extractKeyPathFromFile } from './string-utils.js';
import { AST, type PreprocessorGroup, parse } from 'svelte/compiler';
import printAst from '@vardario/svelte-ast-printer';
import { formatSvelte } from './utils.js';

export function create18nCallLabelAttribute(callIdentifier: string, i18nKey: string) {
  const expression = scriptParse(`${callIdentifier}("${i18nKey}")`, { ecmaVersion: 'latest' });
  let callExpression;

  walk(expression as Node, {
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
        type: 'ExpressionTag',
        expression: callExpression
      }
    ]
  };
}

export function adjustI18nCall(root: any, prefix: string, callIdentifier: string = '$i18n') {
  walk(root, {
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

export function adjustInputElementLabels(fragment: any, prefix: string, callIdentifier: string = '$i18n') {
  walk(fragment, {
    enter: (node: any) => {
      if (node.type === 'Component') {
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

export function adjustI18nKeys(root: AST.Root, prefix: string, callIdentifier: string = '$i18n'): string[] {
  const result: string[] = [];
  if (root.instance) {
    adjustI18nCall(root.instance.content, prefix, callIdentifier);
  }

  if (root.module) {
    adjustI18nCall(root.module.content, prefix, callIdentifier);
  }

  adjustI18nCall(root.fragment, prefix, callIdentifier);
  adjustInputElementLabels(root.fragment, prefix, callIdentifier);
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

async function preprocess(
  content: string,
  filename: string | undefined,
  cb: () => Promise<{ code: string }>
): Promise<{ code: string }> {
  if (filename === undefined) {
    return { code: content };
  }

  if (/node_modules/g.exec(filename) !== null) {
    return {
      code: content
    };
  }

  if (/(components\/|routes\/)/g.exec(filename) !== null) {
    return cb();
  }

  return {
    code: content
  };
}

export const i18nProcessor = (options?: I18nProcessorOptions): PreprocessorGroup => {
  const callIdentifier = options?.callIdentifier ?? '$i18n';
  return {
    async markup({ content, filename }) {
      return preprocess(content, filename, async () => {
        const root = parse(content, { modern: true });
        const keyPath = extractKeyPathFromFile(filename!);
        adjustI18nKeys(root, keyPath, callIdentifier);

        const code = await formatSvelte(printAst(root, options?.indent));
        return { code };
      });
    },
    /**
     * We need this passthrough so that the svelte compiler generates
     * the right source maps for debugging purposes. 
     * @see https://github.com/sveltejs/svelte/blob/bbf38291fcd860319c7eb225f3f942188c1d97bd/packages/svelte/src/compiler/preprocess/index.js#L357
     */
    async script({ content }) {
      return { code: content };
    }
  };
};
