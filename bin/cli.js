#!/usr/bin/env node

import { program } from 'commander';
import { isInSync, synchronies } from '../lib/cli.js';

program.name('svelte-i18next');
program
  .command('synchronies')
  .description('synchronies all translations keys from the given svelte app with translation files')
  .requiredOption('--dirs <string...>', 'path to svelte apps')
  .requiredOption('--languages <string...>')
  .requiredOption('--output <string>')
  .action(async options => {
    await synchronies(options);
  });

program
  .command('in-sync')
  .description('check if all keys are in sync')
  .requiredOption('--dirs <string...>', 'path to svelte apps')
  .requiredOption('--languages <string...>')
  .requiredOption('--output <string>')
  .action(async options => {
    const inSync = await isInSync(options);
    if (inSync) {
      console.log('Translations keys are in sync');
      process.exit(0);
    } else {
      process.exit(1);
    }
  });

program.parse();
