import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const sqlite = new Database('./data/db.sqlite');
const db = drizzle(sqlite);

console.log('Running migrations...');
migrate(db, { migrationsFolder: './db/migrations' });
console.log('Migrations complete!');
