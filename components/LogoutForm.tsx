import { html } from 'hono/html';

interface LogoutFormProps {
  csrfToken: string;
}

export const LogoutForm = ({ csrfToken }: LogoutFormProps) => {
  return html`
    <form action="/logout" method="post" class="inline">
      <input type="hidden" name="_csrf" value="${csrfToken}" />
      <button
        type="submit"
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Logout
      </button>
    </form>
  `;
};
