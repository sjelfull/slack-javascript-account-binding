import { Layout } from './Layout.jsx';
import { Header } from './Header.jsx';
import { Footer } from './Footer.jsx';

export const Home = ({ title, user, message, loginError, csrfToken, pageName }) => {
  return (
    <Layout title={title} pageName={pageName}>
      <Header user={user} loginError={loginError} csrfToken={csrfToken} />
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="bg-white shadow-md rounded-lg p-6">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
          <p class="text-gray-600 mb-4">This is some placeholder text.</p>
          {message && (
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p class="text-blue-700">
                <span class="font-semibold">Current Message:</span> {message}
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </Layout>
  );
};
