import { LoginForm } from './LoginForm.jsx';
import { LogoutForm } from './LogoutForm.jsx';

export const Header = ({ user, loginError, csrfToken, loginFormExtraParams, nonce }) => {
  return (
    <header id="header" class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="user-info flex justify-end">
          {user ? (
            <div class="flex items-center gap-4">
              <span class="text-gray-700">Welcome, <strong>{user.username}</strong></span>
              <LogoutForm csrfToken={csrfToken} />
            </div>
          ) : (
            <div class="w-full max-w-md">
              <LoginForm
                loginError={loginError}
                csrfToken={csrfToken}
                loginFormExtraParams={loginFormExtraParams}
                nonce={nonce}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
