import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ requireManager = false }) {
  const { currentUser, isManager } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireManager && !isManager) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}