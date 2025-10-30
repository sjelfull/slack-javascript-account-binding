import os from 'os';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));

export const packageIdentifier = () => `${pkg.name.replace('/', ':')}/${pkg.version} ${os.platform()}/${os.release()} bun/${Bun.version}`;
