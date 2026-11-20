import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Shell } from './components/Shell';
import { Splash } from './components/Splash';
import { useApp } from './lib/app';
import { defaultDaySlug, keep } from './lib/nav';
import { DayPage } from './pages/DayPage';
import { InfoPage } from './pages/InfoPage';
import { NotFound } from './pages/NotFound';

/** Reset scroll on page change (not on ?e= sheet changes). */
function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

/** First-time visitors (no side chosen yet) land on the welcome page, then return where they were going. */
function RequireSide() {
  const { hasSide } = useApp();
  const loc = useLocation();
  if (!hasSide) return <Navigate to={`/welcome${keep()}`} replace state={{ from: loc.pathname + loc.search }} />;
  return <Shell />;
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Routes>
        <Route path="welcome" element={<Splash />} />
        <Route element={<RequireSide />}>
          <Route index element={<Navigate to={`/day/${defaultDaySlug()}${keep()}`} replace />} />
          <Route path="day/:slug" element={<DayPage />} />
          <Route path="info" element={<InfoPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <Analytics />
    </>
  );
}
