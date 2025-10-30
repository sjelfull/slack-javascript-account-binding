import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import config from 'config';
import { paramCase } from 'param-case';
import type { BunSQLiteDatabase } from 'drizzle-orm/bun-sqlite';
import { sessionMiddleware, csrfMiddleware, getFlash, setFlash } from '../lib/middleware';
import { Home } from '../components/Home.tsx';
import { Register } from '../components/Register.tsx';
import { Association } from '../components/Association.tsx';

export function createWebRouter(db: BunSQLiteDatabase<any>, users: any, message: any) {
  const web = new Hono();

  // Serve static files
  web.use('/public/*', serveStatic({ root: './' }));
  web.get('/app.css', serveStatic({ path: './public/app.css' }));

  // Add session and CSRF middleware
  web.use('*', sessionMiddleware(db));
  web.use('*', csrfMiddleware());

  // Add user to context
  web.use('*', async (c, next) => {
    const session = c.get('getSession')();
    if (session.userId) {
      try {
        const user = await users.findById(session.userId);
        c.set('user', user);
      } catch (error) {
        // User not found, clear session
        session.userId = undefined;
        await c.get('saveSession')(session);
      }
    }
    await next();
  });

  // Add page name to context
  web.use('*', async (c, next) => {
    c.set('pageName', paramCase(new URL(c.req.url).pathname));
    await next();
  });

  // Home page
  web.get('/', async (c) => {
    const user = c.get('user');
    let myMessage: string | undefined;

    try {
      myMessage = await message.getMessage(user);
    } catch (error) {
      // Message not available
    }

    const props = {
      title: "Home",
      user: user,
      message: myMessage,
      loginError: getFlash(c, 'login-error'),
      csrfToken: c.get('csrfToken'),
      pageName: c.get('pageName'),
    };

    return c.html(Home(props));
  });

  // Register page (GET)
  web.get('/register', async (c) => {
    const user = c.get('user');
    if (user) {
      return c.redirect('/');
    }

    const refParam = c.req.query('ref');
    const redirectUrl = refParam 
      ? `${config.get('routes.associationPath')}?ref=${refParam}` 
      : '/';

    const props = {
      title: "Registration",
      registrationError: getFlash(c, 'registration-error'),
      registerFormExtraParams: { redirectUrl },
      csrfToken: c.get('csrfToken'),
      pageName: c.get('pageName'),
    };

    return c.html(Register(props));
  });

  // Login (POST)
  web.post('/login', async (c) => {
    const body = await c.req.parseBody();
    const username = body.username as string;
    const password = body.password as string;
    const redirectUrl = (body.redirectUrl as string) || '/';

    try {
      const user = await users.findByUsername(username);
      const isCorrect = await users.checkPassword(user.id, password);

      if (!isCorrect) {
        setFlash(c, 'login-error', 'Credentials are invalid.');
        return c.redirect(c.req.header('Referer') || '/');
      }

      // Set session
      const session = c.get('getSession')();
      session.userId = user.id;
      await c.get('saveSession')(session);

      return c.redirect(redirectUrl);
    } catch (error: any) {
      if (error.code === 'EUSERNOTFOUND') {
        setFlash(c, 'login-error', 'Credentials are invalid.');
      } else {
        setFlash(c, 'login-error', 'An error occurred during login.');
      }
      return c.redirect(c.req.header('Referer') || '/');
    }
  });

  // Logout (POST)
  web.post('/logout', async (c) => {
    const session = c.get('getSession')();
    session.userId = undefined;
    await c.get('saveSession')(session);
    return c.redirect('/');
  });

  // Register (POST)
  web.post('/register', async (c) => {
    const body = await c.req.parseBody();
    const username = body.username as string;
    const password = body.password as string;
    const confirmPassword = body.confirmPassword as string;
    const redirectUrl = (body.redirectUrl as string) || '/';

    if (!password || !confirmPassword || password !== confirmPassword) {
      setFlash(c, 'registration-error', 'Password and confirm password fields must match.');
      return c.redirect('/register');
    }

    try {
      const user = await users.register({ username, password });

      // Set session
      const session = c.get('getSession')();
      session.userId = user.id;
      await c.get('saveSession')(session);

      return c.redirect(redirectUrl);
    } catch (error: any) {
      setFlash(c, 'registration-error', `An error occurred: ${error.message}`);
      return c.redirect('/register');
    }
  });

  // Association page
  web.get(config.get('routes.associationPath') as string, async (c) => {
    const user = c.get('user');
    const refParam = c.req.query('ref');

    if (!user) {
      const props = {
        title: "Slack User Association",
        mainMessage: "You must login before user association can be completed.",
        renderLoginForm: true,
        nonce: refParam,
        loginFormExtraParams: { redirectUrl: c.req.url },
        loginError: getFlash(c, 'login-error'),
        csrfToken: c.get('csrfToken'),
        pageName: c.get('pageName'),
      };
      return c.html(Association(props));
    }

    if (user.slackId) {
      const props = {
        title: "Slack User Association",
        mainMessage: "Your user account is already associated with a Slack user.",
        user: user,
        csrfToken: c.get('csrfToken'),
        pageName: c.get('pageName'),
      };
      return c.html(Association(props));
    }

    if (refParam) {
      try {
        await users.completeSlackAssociation(user.id, refParam);
        const props = {
          title: "Slack User Association",
          mainMessage: "Your user account has successfully been associated with your Slack user.",
          user: user,
          csrfToken: c.get('csrfToken'),
          pageName: c.get('pageName'),
          redirectUrl: "/",
        };
        return c.html(Association(props));
      } catch (error: any) {
        const props = {
          title: "Slack User Association",
          mainMessage: `An error occurred: ${error.message}`,
          user: user,
          csrfToken: c.get('csrfToken'),
          pageName: c.get('pageName'),
        };
        return c.html(Association(props));
      }
    }

    const props = {
      title: "Slack User Association",
      mainMessage: "You must begin the user association process before visiting this page.",
      user: user,
      csrfToken: c.get('csrfToken'),
      pageName: c.get('pageName'),
    };
    return c.html(Association(props));
  });

  return web;
}
