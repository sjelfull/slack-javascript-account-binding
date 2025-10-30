import { URL } from 'url';
import config from 'config';
import { v4 as uuid } from 'uuid';
import randomstring from 'randomstring';
import bcrypt from 'bcryptjs';
import { WebClient } from '@slack/web-api';
import { eq } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { users, associationLinks } from '../db/schema';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  slackId?: string | null;
  slackDmChannelId?: string | null;
}

interface RegisterInput {
  username: string;
  password: string;
}

export default (db: BunSQLiteDatabase<any>) => {
  return {
    async findById(id: string): Promise<User> {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (result.length === 0) {
        const notFoundError = new Error('User not found');
        (notFoundError as any).code = 'EUSERNOTFOUND';
        throw notFoundError;
      }

      return {
        id: result[0].id,
        username: result[0].username,
        passwordHash: result[0].passwordHash,
        slackId: result[0].slackId,
        slackDmChannelId: result[0].slackDmChannelId,
      };
    },

    async setById(id: string, user: User): Promise<User> {
      await db.update(users)
        .set({
          username: user.username,
          passwordHash: user.passwordHash,
          slackId: user.slackId,
          slackDmChannelId: user.slackDmChannelId,
        })
        .where(eq(users.id, id));
      
      return user;
    },

    async findByUsername(username: string): Promise<User> {
      const result = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (result.length === 0) {
        const notFoundError = new Error('User not found');
        (notFoundError as any).code = 'EUSERNOTFOUND';
        throw notFoundError;
      }

      return {
        id: result[0].id,
        username: result[0].username,
        passwordHash: result[0].passwordHash,
        slackId: result[0].slackId,
        slackDmChannelId: result[0].slackDmChannelId,
      };
    },

    async findBySlackId(slackId: string): Promise<User> {
      const result = await db.select()
        .from(users)
        .where(eq(users.slackId, slackId))
        .limit(1);

      if (result.length === 0) {
        const notFoundError = new Error('User not found');
        (notFoundError as any).code = 'EUSERNOTFOUND';
        throw notFoundError;
      }

      return {
        id: result[0].id,
        username: result[0].username,
        passwordHash: result[0].passwordHash,
        slackId: result[0].slackId,
        slackDmChannelId: result[0].slackDmChannelId,
      };
    },

    async checkPassword(userId: string, password: string): Promise<boolean> {
      const user = await this.findById(userId);
      if (!user.passwordHash) {
        return false;
      }
      return bcrypt.compare(password, user.passwordHash);
    },

    async register({ username, password }: RegisterInput): Promise<User> {
      if (!username) {
        throw new Error('A username is required');
      }
      if (!password) {
        throw new Error('A password is required');
      }

      try {
        await this.findByUsername(username);
        throw new Error('The username is not available');
      } catch (findError: any) {
        if (findError.code !== 'EUSERNOTFOUND') {
          throw findError;
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = uuid();
        
        await db.insert(users).values({
          id: userId,
          username,
          passwordHash,
          createdAt: new Date(),
        });

        return {
          id: userId,
          username,
          passwordHash,
        };
      }
    },

    async beginSlackAssociation(slackUserId: string): Promise<string> {
      const ref = randomstring.generate();
      
      const response = await slack.conversations.open({ users: slackUserId });
      const dmChannelId = response.channel?.id;

      if (!dmChannelId) {
        throw new Error('Could not open DM channel');
      }

      const serverConfig = config.get('server') as any;
      const authUrl = new URL(
        config.get('routes.associationPath') as string,
        `${serverConfig.protocol}://${serverConfig.host}:${serverConfig.port}`
      );
      authUrl.searchParams.set('ref', ref);

      await Promise.all([
        slack.chat.postMessage({
          channel: dmChannelId,
          text: "Hello, new friend! I think it's time we introduce ourselves. I'm a bot that helps you access your internal protected resources.",
          attachments: [
            {
              text: `<${authUrl.toString()}|Click here> to introduce yourself to me by authenticating.`,
            },
          ],
        }),
        db.insert(associationLinks).values({
          ref,
          slackUserId,
          dmChannelId,
          createdAt: new Date(),
        }),
      ]);

      return ref;
    },

    async completeSlackAssociation(userId: string, associationRef: string): Promise<void> {
      const linkResult = await db.select()
        .from(associationLinks)
        .where(eq(associationLinks.ref, associationRef))
        .limit(1);

      if (linkResult.length === 0) {
        throw new Error('The user association link was not valid.');
      }

      const link = linkResult[0];

      await Promise.all([
        db.update(users)
          .set({
            slackId: link.slackUserId,
            slackDmChannelId: link.dmChannelId,
          })
          .where(eq(users.id, userId)),
        slack.chat.postMessage({
          channel: link.dmChannelId,
          text: "Well, it's nice to meet you! Thanks for completing authentication.",
        }),
      ]);

      await db.delete(associationLinks).where(eq(associationLinks.ref, associationRef));
    },
  };
};
