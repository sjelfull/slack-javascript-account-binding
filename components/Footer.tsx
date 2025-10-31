import { html } from 'hono/html';

export const Footer = () => {
  return html`
    <footer id="footer" class="bg-gray-800 text-white mt-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-center text-sm">
          Slack Account Binding Template
        </p>
      </div>
    </footer>
  `;
};
