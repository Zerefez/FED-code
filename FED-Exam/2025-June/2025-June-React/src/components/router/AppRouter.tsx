import { Layout } from '@/components/layout';
import { routes } from '@/router';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {routes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </Layout>
    </BrowserRouter>
  );
} 