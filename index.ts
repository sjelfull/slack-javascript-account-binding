import 'dotenv/config';
import { Hono } from 'hono';
import config from 'config';
import { db } from './db';
import usersFactory from './lib/users';
import messageFactory from './lib/message';
import { createWebRouter } from './routers/web';
import { createApiRouter } from './routers/api';

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
