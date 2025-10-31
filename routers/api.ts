import axios from 'axios';
import { Hono } from 'hono';
import { packageIdentifier } from '../lib/util';

const slackVerificationToken = process.env.SLACK_VERIFICATION_TOKEN;
const httpClient = axios.create({
  headers: { 'User-Agent': packageIdentifier() },
});

interface SlackCommandBody {
  token: string;
  user_id: string;
  command: string;
  text: string;
  response_url: string;
}

export function createApiRouter(users: any, message: any) {
  const api = new Hono();

  const commands: Record<string, (params: { user: any; text: string }) => Promise<string>> = {
    '/read-message': async ({ user }) => {
      const m = await message.getMessage(user);
      return `The message is: ${m}`;
    },
    '/write-message': async ({ user, text }) => {
      const m = await message.setMessage(text, user);
      return `The message has been set: ${m}`;
    },
  };

  api.post('/slack/command', async (c) => {
    const body = (await c.req.parseBody()) as unknown as SlackCommandBody;

    // Verify request is from Slack
    if (body.token !== slackVerificationToken) {
      return c.json({ error: 'Could not verify the request originated from Slack.' }, 401);
    }

    // Respond to Slack immediately
    c.executionCtx.waitUntil(
      (async () => {
        try {
          // Authenticate the Slack user
          const user = await users.findBySlackId(body.user_id);

          // Execute command
          const command = commands[body.command];
          if (!command) {
            throw new Error(`Cannot understand the command: \`${body.command}\``);
          }

          const response = await command({ user, text: body.text });

          await httpClient.post(body.response_url, {
            response_type: 'in_channel',
            text: response,
          });
        } catch (error: any) {
          let errorMessage = error.message;

          // Handle user not found error
          if (error.code === 'EUSERNOTFOUND') {
            await users.beginSlackAssociation(body.user_id);
            errorMessage = `Sorry <@${body.user_id}>, you cannot run \`${body.command}\` until after you authenticate. I can help you, just check my DM for the next step, and then you can try the command again.`;
          }

          await httpClient.post(body.response_url, {
            response_type: 'in_channel',
            text: errorMessage,
          });
        }
      })()
    );

    return c.json({ response_type: 'in_channel' });
  });

  return api;
}
