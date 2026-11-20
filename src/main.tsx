import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { lazy, Suspense, useEffect, useSyncExternalStore } from 'react';
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource/hanken-grotesk/latin-400.css';
import '@fontsource/hanken-grotesk/latin-500.css';
import '@fontsource/hanken-grotesk/latin-600.css';
import '@fontsource/noto-sans-devanagari/devanagari-400.css';
import '@fontsource/noto-sans-devanagari/devanagari-600.css';
import '@fontsource/tiro-devanagari-hindi/devanagari-400.css';
import './index.css';
import App from './App';
import { AppProvider } from './lib/app';
import { bootFromCache, getRev, startAutoRefresh, subscribeContent } from './lib/content';
import { registerSW } from 'virtual:pwa-register';

// Pick up new deploys quickly: check on load, when the app comes back to the foreground, and hourly.
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    if (!reg) return;
    const check = () => { if (navigator.onLine) reg.update().catch(() => {}); };
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
    setInterval(check, 60 * 60 * 1000);
  },
});

bootFromCache();

// Admin is code-split so guests never download it, and it sits OUTSIDE the content-keyed tree below so a background
// content refresh can never remount it and wipe an in-progress edit.
const AdminApp = lazy(() => import('./admin/AdminApp'));

/** Re-mounts the guest UI when new content arrives (all data modules are live bindings read at render). */
function ContentGate() {
  const rev = useSyncExternalStore(subscribeContent, getRev);
  useEffect(() => startAutoRefresh(), []);
  return <App key={rev} />;
}

function Root() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <Suspense fallback={null}><AdminApp /></Suspense>;
  }
  return <ContentGate />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <Root />
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
);
