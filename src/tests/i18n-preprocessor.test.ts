import fs from 'node:fs/promises';
import path from 'node:path';
import * as compiler from 'svelte/compiler';
import { describe, expect, test } from 'vitest';
import { i18nProcessor } from '../i18n-preprocessor.js';
import { __dirname, formatSvelte } from '../utils.js';

const examplePath = path.resolve(__dirname(import.meta), './assets/example');

async function testComponent(filename: string, expectation: string) {
  const componentPath = path.resolve(examplePath, filename);
  const componentContent = (await fs.readFile(componentPath)).toString('utf-8');
  const preprocessed = await compiler.preprocess(
    componentContent,
    [
      i18nProcessor({
        indent: {
          indent: '',
          lineEnd: ''
        }
      })
    ],
    { filename }
  );

  const formattedCode = await formatSvelte(preprocessed.code);
  const formattedExpectation = await formatSvelte(expectation);

  expect(formattedCode).toBe(formattedExpectation);
}

describe('i18n-preprocessor', () => {
  test('adjustInputElement', async () => {
    await testComponent(
      'components/user-form.svelte',
      `
      <Form>
        <Input name="firstName" label={$i18n("components.user-form.firstName")} />
        <Input name="lastName" label={$i18n("components.user-form.lastName")} />
        <Select
          name="countryCode"
          label={$i18n("components.user-form.countryCode")}
        />
        <BubbleSelect
          name="amenities"
          label={$i18n("components.user-form.amenities")}
        />
        <LocalizedInput name="text" label={$i18n("components.user-form.text")} />
      </Form>
      `
    );
  });

  test('adjustI18nCall', async () => {
    await testComponent(
      'routes/+page.svelte',
      `
      <script lang="ts">
        function $i18n(key: string, params?: any) {
          return key;
        }
        let title = $i18n("routes.page.title");
        const def = [$i18n("routes.page.item0"), $i18n("routes.page.item1")];
      </script>

      <main>
        <section>
          {$i18n("routes.page.intro")}
        </section>
        <section>
          {$i18n("routes.page.known-from", { param: "hello" })}
        </section>
        <section>{title}</section>
      </main>
      `
    );
  });
});
