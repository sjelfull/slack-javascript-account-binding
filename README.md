# Account Binding Template

A Sample Slack app that shows how a user account on Slack can be bound to an account on another system.

**Now powered by Hono, Bun, TypeScript, Drizzle ORM, and Tailwind CSS!**

![account-binding](https://user-images.githubusercontent.com/700173/27056630-b57cd40c-4f7d-11e7-98f1-7e723f472192.gif)

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast all-in-one JavaScript runtime
- **Framework**: [Hono](https://hono.dev/) - Ultrafast web framework
- **Language**: TypeScript
- **Database**: SQLite with [Drizzle ORM](https://orm.drizzle.team/)
- **UI**: Tailwind CSS (CDN)
- **Views**: TSX with Hono's html tagged templates

## Setup

#### Prerequisites

1. Install Bun:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

#### Create a Slack app

1. Create an app at api.slack.com/apps
1. Click on `Bot Users`
1. Add a bot user and make sure it displays as always online
1. Install the app and copy the `xoxb-` token

#### Run locally

1. Get the code
    * Clone this repo and run `bun install`
1. Set the following environment variables in `.env` (see `.env.sample`):
    * `SLACK_BOT_TOKEN`: Your app's `xoxb-` token (available on the Install App page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
    * `SESSION_SECRET`: A randomly generated secret for your session storage
1. Run database migrations:
    ```bash
    bun run db:generate  # Generate migrations (only needed when schema changes)
    bun run db:migrate   # Run migrations
    ```
1. Start the app:
    ```bash
    bun start            # Production mode
    # or
    bun run dev          # Development mode with auto-reload
    ```
1. For external access (e.g., for Slack webhooks), use ngrok:
    ```bash
    ngrok http 3000
    ```

#### Add Slash Commands

1. Go back to the app settings and click on Slash Commands
1. Add the following Slash Commands:
    * Command: /read-message
        * Request URL: ngrok URL + `/api/slack/command`
        * Description: Read secret message
    * Command: /write-message
        * Request URL: ngrok URL + `/api/slack/command`
        * Description: Write secret message
        * Usage Hint: [message]
1. Reinstall the app by navigating to the Install App page

#### In Slack

1. In any channel, run /read-message
1. You should see a DM from the bot asking you to link your accounts

## Migration from Express

This application was migrated from Express to Hono with the following changes:

- **Express → Hono**: Modern, faster web framework
- **Node.js → Bun**: Faster JavaScript runtime with built-in TypeScript support
- **JavaScript → TypeScript**: Type safety throughout
- **LevelDB → SQLite + Drizzle ORM**: More robust database with a modern ORM
- **Pug → TSX**: Component-based views with Hono's html tagged templates
- **Custom CSS → Tailwind CSS**: Utility-first CSS framework
- **@slack/client → @slack/web-api**: Updated Slack SDK
