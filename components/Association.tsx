import { html } from 'hono/html';
import { Footer } from './Footer.tsx';
import { Header } from './Header.tsx';
import { Layout } from './Layout.tsx';
import { LoginForm } from './LoginForm.tsx';

interface User {
  username: string;
}

interface AssociationProps {
  title: string;
  mainMessage: string;
  user?: User | null;
  renderLoginForm?: boolean;
  nonce?: string;
  loginFormExtraParams?: Record<string, string>;
  loginError?: string;
  csrfToken: string;
  pageName?: string;
  redirectUrl?: string;
}

export const Association = ({
  title,
  mainMessage,
  user,
  renderLoginForm,
  nonce,
  loginFormExtraParams,
  loginError,
  csrfToken,
  pageName,
  redirectUrl,
}: AssociationProps) => {
  return Layout({
    title,
    pageName,
    children: html`
      ${Header({ user, csrfToken })}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">${title}</h2>
          ${
            mainMessage
              ? html`
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
              <p class="text-blue-700">${mainMessage}</p>
            </div>
          `
              : ''
          }
          ${
            redirectUrl
              ? html`
            <p class="text-gray-600 mb-4">You will be redirected in a few seconds...</p>
            <script>
              window.setTimeout(function () { window.location.replace('${redirectUrl}'); }, 6000);
            </script>
          `
              : ''
          }
          ${renderLoginForm ? LoginForm({ loginError, csrfToken, loginFormExtraParams, nonce }) : ''}
        </div>
      </main>
      ${Footer()}
    `,
  });
};
