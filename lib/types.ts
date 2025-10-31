import type { Context } from 'hono';

export interface User {
  id: string;
  username: string;
  passwordHash?: string;
  slackId?: string | null;
  slackDmChannelId?: string | null;
}

export interface SessionData {
  userId?: string;
  flash?: Record<string, string>;
  csrfToken?: string;
  [key: string]: any;
}

export interface AppContext {
  Variables: {
    sessionId: string;
    sessionData: SessionData;
    getSession: () => SessionData;
    saveSession: (data: SessionData) => Promise<void>;
    csrfToken: string;
    user?: User;
    pageName?: string;
  };
}

export type AppContextType = Context<AppContext>;
