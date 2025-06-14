import { AuthLayout } from '@/components/auth-layout';
import { Dashboard } from '@/components/dashboard';
import { HabitsPage } from '@/components/habits-page';
import { LoginForm } from '@/components/login-form';
import { ProfilePage } from '@/components/profile-page';
import { RegisterForm } from '@/components/register-form';
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