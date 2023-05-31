import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import _ from 'lodash';

const CSV_OPTIONS = {
  delimiter: ';',
  trim: true,
  bom: true
};

export function parseCsv(csv: string): Record<string, string> {
  const items = parse(csv, {
    delimiter: ';',
    trim: true,
    bom: true
  }) as string[][];

  return items.reduce((acc, item) => {
    if (item.length === 2) {
      acc[item[0]] = item[1];
    }

    return acc;
  }, {} as Record<string, string>);
}

export function recordsToCsv(items: Record<string, string>) {
  const keys = _.keys(items);
  const values = _.values(items);
  const csv = keys.reduce((acc, key, index) => {
    acc.push([key, values[index]]);
    return acc;
  }, [] as string[][]);

  return stringify(
    csv.sort((a, b) => a[0].localeCompare(b[0])),
    CSV_OPTIONS
  );
}

export function csvToI18Next(csv: string) {
  const object = {};

  const items = parse(csv, CSV_OPTIONS) as string[];

  for (const item of items) {
    const [path, value] = item;
    _.set(object, path, value);
  }
  return object;
}
