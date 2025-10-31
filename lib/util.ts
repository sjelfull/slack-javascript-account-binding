import { readFileSync } from 'fs';
import os from 'os';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

export const packageIdentifier = (): string =>
  `${pkg.name.replace('/', ':')}/${pkg.version} ${os.platform()}/${os.release()} bun/${Bun.version}`;
