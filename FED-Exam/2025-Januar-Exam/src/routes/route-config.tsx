import { AuthLayout } from '@/components/auth/auth-layout';
import { LoginForm } from '@/components/auth/login-form';
import { RegisterForm } from '@/components/auth/register-form';
import { Dashboard } from '@/pages/dashboard';
import { HabitsPage } from '@/pages/habits-page';
import { ProfilePage } from '@/pages/profile-page';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { ProtectedRoutes } from './protected-routes';

// Route configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth/login" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/auth/login" replace />,
      },
      {
        path: 'login',
        element: <LoginForm />,
      },
      {
        path: 'register',
        element: <RegisterForm />,
      },
    ],
  },
  {
    path: '/app',
    element: <ProtectedRoutes />,
    children: [
      {
        path: '',
        element: <Navigate to="/app/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'habits',
        element: <HabitsPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/auth/login" replace />,
  },
]);

export default router; 