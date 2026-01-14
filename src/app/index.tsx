import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from 'shared/contexts';
import { installMockFetch } from 'shared/api/mockFetch/installMockFetch';
import { Header } from 'widgets/header';
import { SignInPage } from 'pages/sign-in';
import { NotPlannedPage } from 'pages/not-planned';
import './styles/global.pcss';

export function App(): JSX.Element {
  return (
    <AccessibilityProvider>
      <BrowserRouter
        basename={import.meta.env.BASE_URL}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<SignInPage />} />
            <Route path="/not-planned" element={<NotPlannedPage />} />
            <Route path="/forgot-password" element={<NotPlannedPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AccessibilityProvider>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

installMockFetch();

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

