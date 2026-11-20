import { Navigate, Route, Routes } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { Shell } from './components/Shell';
import { Splash } from './components/Splash';
import { useApp } from './lib/app';
import { defaultDaySlug, keep } from './lib/nav';
import { DayPage } from './pages/DayPage';
import { InfoPage } from './pages/InfoPage';
import { NotFound } from './pages/NotFound';

export default function App() {
  const { splash } = useApp();
  return (
    <>
      {splash ? <Splash /> : <AppRoutes />}
      <Analytics />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Navigate to={`/day/${defaultDaySlug()}${keep()}`} replace />} />
        <Route path="day/:slug" element={<DayPage />} />
        <Route path="info" element={<InfoPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
