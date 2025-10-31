import 'dotenv/config';
import config from 'config';
import { Hono } from 'hono';
import { db } from './db';
import messageFactory from './lib/message';
import usersFactory from './lib/users';
import { createApiRouter } from './routers/api';
import { createWebRouter } from './routers/web';

const users = usersFactory(db);
const message = messageFactory(db, users);

const app = new Hono();

// Mount routers
app.route('/api', createApiRouter(users, message));
app.route('/', createWebRouter(db, users, message));

const port = config.has('server.internalPort')
  ? config.get('server.internalPort')
  : config.get('server.port');

console.log(`Server listening on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
