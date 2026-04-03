import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const CashierRoute = () => {
  const { user, isAuthenticated } = useAuthStore();
  const isCashier = user?.role === 'cashier';

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isCashier) return <Navigate to="/admin" replace />;

  return <Outlet />;
};

export default CashierRoute;
