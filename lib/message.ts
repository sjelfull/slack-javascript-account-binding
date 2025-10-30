import { eq } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { messages } from '../db/schema';

const messageKey = 'MESSAGE';
const initialValue = 'Hello World';
const selfCredential = Symbol('self');

interface User {
  id: string;
  username: string;
}

interface UsersModule {
  findById(id: string): Promise<User>;
}

export default (db: BunSQLiteDatabase<any>, users: UsersModule) => {
  function isUser(credential: User): Promise<boolean> {
    return users.findById(credential.id).then(() => true).catch(() => false);
  }

  function authorizeSelfOrUser(credential: User | symbol): Promise<boolean> {
    if (credential === selfCredential) {
      return Promise.resolve(true);
    }
    return isUser(credential as User);
  }

  return {
    async initialize(): Promise<string> {
      return this.setMessage(initialValue, selfCredential);
    },

    async getMessage(credential: User | symbol = {}): Promise<string> {
      const isAuthorized = await authorizeSelfOrUser(credential);
      if (!isAuthorized) {
        throw new Error('Not Authorized');
      }

      const result = await db.select()
        .from(messages)
        .where(eq(messages.key, messageKey))
        .limit(1);

      if (result.length === 0) {
        return this.initialize();
      }

      return result[0].value;
    },

    async setMessage(newMessage: string, credential: User | symbol = {}): Promise<string> {
      const isAuthorized = await authorizeSelfOrUser(credential);
      if (!isAuthorized) {
        throw new Error('Not Authorized');
      }

      await db.insert(messages)
        .values({
          key: messageKey,
          value: newMessage,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: messages.key,
          set: {
            value: newMessage,
            updatedAt: new Date(),
          },
        });

      return newMessage;
    },
  };
};
