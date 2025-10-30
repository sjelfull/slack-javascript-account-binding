import { html } from 'hono/html';
import { Layout } from './Layout.tsx';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';

interface RegisterProps {
  title: string;
  registrationError?: string;
  registerFormExtraParams?: Record<string, string>;
  csrfToken: string;
  pageName?: string;
}

export const Register = ({ title, registrationError, registerFormExtraParams, csrfToken, pageName }: RegisterProps) => {
  const extraParamsHTML = registerFormExtraParams 
    ? Object.entries(registerFormExtraParams).map(([key, value]) => 
        html`<input type="hidden" name="${key}" value="${value}" />`
      ).join('')
    : '';

  return Layout({
    title,
    pageName,
    children: html`
      ${Header({ user: null, csrfToken })}
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">${title}</h2>
          ${registrationError ? html`
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <p>${registrationError}</p>
            </div>
          ` : ''}
          <form class="login" action="/register" method="post">
            <p class="text-gray-700 mb-4">User Registration</p>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
                Username
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="text"
                id="username"
                name="username"
                required
              />
            </div>
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                Password
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                id="password"
                name="password"
                required
              />
            </div>
            <div class="mb-6">
              <label class="block text-gray-700 text-sm font-bold mb-2" for="confirm_password">
                Confirm Password
              </label>
              <input
                class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="password"
                id="confirm_password"
                name="confirmPassword"
                required
              />
            </div>
            <input type="hidden" name="_csrf" value="${csrfToken}" />
            ${extraParamsHTML}
            <div>
              <button
                class="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </main>
      ${Footer()}
    `,
  });
};
