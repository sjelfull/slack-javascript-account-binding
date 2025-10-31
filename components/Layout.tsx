import { html } from 'hono/html';
import type { HtmlEscapedString } from 'hono/utils/html';

interface LayoutProps {
  title: string;
  children: HtmlEscapedString | Promise<HtmlEscapedString>;
  pageName?: string;
}

export const Layout = ({ title, children, pageName }: LayoutProps) => {
  return html`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="x-ua-compatible" content="ie=edge" />
    <meta name="description" content="Slack Team Based Authentication Template" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Slack Team Based Authentication Template - ${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="${pageName ? `page-${pageName}` : ''}">
    <div id="container" class="min-h-screen bg-gray-50">
      ${children}
    </div>
  </body>
</html>`;
};
