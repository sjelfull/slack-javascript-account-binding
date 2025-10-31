import { randomBytes } from 'crypto';
import { eq, lt } from 'drizzle-orm';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { sessions } from '../db/schema';
import type { AppContext, SessionData } from './types';

const SESSION_COOKIE_NAME = 'session_id';
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

export function sessionMiddleware(db: BunSQLiteDatabase<any>) {
  return createMiddleware<AppContext>(async (c, next) => {
    // Clean up expired sessions periodically
    await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

    const sessionId = getCookie(c, SESSION_COOKIE_NAME);
    let sessionData: SessionData = {};

    if (sessionId) {
      const result = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);

      if (result.length > 0 && result[0].expiresAt > new Date()) {
        sessionData = JSON.parse(result[0].data);
      }
    }

    // Create new session ID if needed
    const newSessionId = sessionId || randomBytes(32).toString('hex');

    // Attach session to context
    c.set('sessionId', newSessionId);
    c.set('sessionData', sessionData);

    // Helper to get session data
    c.set('getSession', () => c.get('sessionData'));

    // Helper to save session
    c.set('saveSession', async (data: SessionData) => {
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

      await db
        .insert(sessions)
        .values({
          id: newSessionId,
          data: JSON.stringify(data),
          expiresAt,
        })
        .onConflictDoUpdate({
          target: sessions.id,
          set: {
            data: JSON.stringify(data),
            expiresAt,
          },
        });

      setCookie(c, SESSION_COOKIE_NAME, newSessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: SESSION_MAX_AGE / 1000,
        path: '/',
      });
    });

    await next();
  });
}

// CSRF Protection
export function csrfMiddleware() {
  return createMiddleware<AppContext>(async (c, next) => {
    const session = c.get('getSession')();

    // Generate CSRF token if not exists
    if (!session.csrfToken) {
      session.csrfToken = randomBytes(32).toString('hex');
      await c.get('saveSession')(session);
    }

    c.set('csrfToken', session.csrfToken);

    // Verify CSRF token for POST requests
    if (c.req.method === 'POST') {
      const body = await c.req.parseBody();
      const submittedToken = body._csrf as string;

      if (!submittedToken || submittedToken !== session.csrfToken) {
        return c.text('Invalid CSRF token', 403);
      }
    }

    await next();
  });
}

// Flash messages
export function getFlash(c: Context<AppContext>, key: string): string | undefined {
  const session = c.get('getSession')();
  const value = session.flash?.[key];

  if (value && session.flash) {
    delete session.flash[key];
    c.get('saveSession')(session);
  }

  return value;
}

export function setFlash(c: Context<AppContext>, key: string, value: string): void {
  const session = c.get('getSession')();
  if (!session.flash) {
    session.flash = {};
  }
  session.flash[key] = value;
  c.get('saveSession')(session);
}
