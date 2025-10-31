import { html } from 'hono/html';
import { LoginForm } from './LoginForm.tsx';
import { LogoutForm } from './LogoutForm.tsx';

interface User {
  username: string;
}

interface HeaderProps {
  user?: User | null;
  loginError?: string;
  csrfToken: string;
  loginFormExtraParams?: Record<string, string>;
  nonce?: string;
}

export const Header = ({
  user,
  loginError,
  csrfToken,
  loginFormExtraParams,
  nonce,
}: HeaderProps) => {
  return html`
    <header id="header" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="user-info flex justify-end">
          ${
            user
              ? html`
            <div class="flex items-center gap-4">
              <span class="text-gray-700">Welcome, <strong>${user.username}</strong></span>
              ${LogoutForm({ csrfToken })}
            </div>
          `
              : html`
            <div class="w-full max-w-md">
              ${LoginForm({ loginError, csrfToken, loginFormExtraParams, nonce })}
            </div>
          `
          }
        </div>
      </div>
    </header>
  `;
};
