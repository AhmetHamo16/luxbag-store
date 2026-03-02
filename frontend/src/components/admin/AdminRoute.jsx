import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AdminRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />; // Redirect non-admins

  return <Outlet />;
};

export default AdminRoute;
