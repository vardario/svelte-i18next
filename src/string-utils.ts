import path from 'node:path';

export function stripScriptTag(code: string) {
  const scriptTagRegEx = /(<script[\s\S]*?[\s\S\]*?>[\s\S]*?<\/script>)/gi;
  const scriptTags: string[] = [];

  for (const match of code.matchAll(scriptTagRegEx)) {
    scriptTags.push(match[0]);
  }

  return { code: code.replace(scriptTagRegEx, ''), scriptTags };
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
  return result
    .replace('.svelte', '')
    .replace('+', '')
    .replace(/\[|\]/g, '')
    .replace(/\((.+)\)\./, '');
}

export function addPrefixToI18nArgument(input: string, prefix: string): string {
  const regex = /\$i18n\(\s*(['"])(.*?)\1(\s*,\s*[^)]*)?\s*\)/g;

  return input.replace(regex, (_, quote, arg, rest) => {
    const prefixedArg = `${prefix}.${arg}`;
    return `$i18n(${quote}${prefixedArg}${quote}${rest || ''})`;
  });
}
