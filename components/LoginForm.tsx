import { html } from 'hono/html';

interface LoginFormProps {
  loginError?: string;
  csrfToken: string;
  loginFormExtraParams?: Record<string, string>;
  nonce?: string;
}

export const LoginForm = ({ loginError, csrfToken, loginFormExtraParams, nonce }: LoginFormProps) => {
  return html`
    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      ${loginError ? html`
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>${loginError}</p>
        </div>
      ` : ''}
      <form class="login" action="/login" method="post">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="login_username">
            Username
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="text"
            id="login_username"
            name="username"
            required
          />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="login_password">
            Password
          </label>
          <input
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            type="password"
            id="login_password"
            name="password"
            required
          />
        </div>
        <input type="hidden" name="_csrf" value="${csrfToken}" />
        ${loginFormExtraParams ? Object.entries(loginFormExtraParams).map(([key, value]) => 
          html`<input type="hidden" name="${key}" value="${value}" />`
        ) : ''}
        <div class="flex items-center justify-between">
          <button
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Login
          </button>
          ${nonce ? html`
            <a
              class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/register?ref=${nonce}"
            >
              Register
            </a>
          ` : html`
            <a
              class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
              href="/register"
            >
              Register
            </a>
          `}
        </div>
      </form>
    </div>
  `;
};
