import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { i18nProcessor } from './i18n-preprocessor.js';
import { __dirname } from './utils.js';

const examplePath = path.resolve(__dirname(import.meta), '../assets/example');
const preprocessor = i18nProcessor({
  indent: {
    indent: '',
    lineEnd: ''
  }
});

describe('i18n-preprocessor', () => {
  test('adjustInputElement', async () => {
    const userFormPath = path.resolve(examplePath, 'components/user-form.svelte');
    const userFormFile = (await fs.readFile(userFormPath)).toString('utf-8');

    const result = await preprocessor.markup?.({
      content: userFormFile,
      filename: userFormPath
    });

    expect(result?.code).toBe(`<Form>
    <Input name="firstName" label={$i18n("components.user-form.firstName")}/>
    <Input name="lastName" label={$i18n("components.user-form.lastName")}/>
</Form>`);
    
  });

  test('adjustI18nCall', async () => {
    const rootPagePath = path.resolve(examplePath, 'routes/+page.svelte');
    const rootPage = (await fs.readFile(rootPagePath)).toString('utf-8');

    const result = await preprocessor.markup?.({
      content: rootPage,
      filename: rootPagePath
    });

    expect(result?.code).toBe(`<main>
    <section>
        {$i18n("routes.page.intro")}
    </section>
    <section>
        {$i18n("routes.page.known-from", {param: 'hello'})}
    </section>
</main>`);

  });
});
