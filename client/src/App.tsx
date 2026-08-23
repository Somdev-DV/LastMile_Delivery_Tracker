import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Layouts
import { CustomerLayout } from './layouts/CustomerLayout';
import { AgentLayout } from './layouts/AgentLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateOrderPage from './pages/customer/CreateOrderPage';
import OrdersPage from './pages/customer/OrdersPage';
import OrderDetailPage from './pages/customer/OrderDetailPage';
import TrackingPage from './pages/customer/TrackingPage';
import ReschedulePage from './pages/customer/ReschedulePage';
import NotificationsPage from './pages/customer/NotificationsPage';
import ProfilePage from './pages/customer/ProfilePage';

// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AssignedDeliveriesPage from './pages/agent/AssignedDeliveriesPage';
import DeliveryDetailPage from './pages/agent/DeliveryDetailPage';
import DeliveryHistoryPage from './pages/agent/DeliveryHistoryPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import AgentsPage from './pages/admin/AgentsPage';
import ZonesPage from './pages/admin/ZonesPage';
import AreaMappingPage from './pages/admin/AreaMappingPage';
import RateCardsPage from './pages/admin/RateCardsPage';
import CodConfigPage from './pages/admin/CodConfigPage';
import UsersPage from './pages/admin/UsersPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';

// Protected Route Component
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles: Array<'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN'>;
}> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'DELIVERY_AGENT') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root Redirect Component based on role
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'DELIVERY_AGENT') return <Navigate to="/agent/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer Routes */}
            <Route
              path="/customer/*"
              element={
                <ProtectedRoute allowedRoles={['CUSTOMER']}>
                  <CustomerLayout>
                    <Routes>
                      <Route path="dashboard" element={<CustomerDashboard />} />
                      <Route path="orders" element={<OrdersPage />} />
                      <Route path="orders/create" element={<CreateOrderPage />} />
                      <Route path="orders/:id" element={<OrderDetailPage />} />
                      <Route path="orders/:id/track" element={<TrackingPage />} />
                      <Route path="orders/:id/reschedule" element={<ReschedulePage />} />
                      <Route path="notifications" element={<NotificationsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                      <Route path="*" element={<Navigate to="/customer/dashboard" replace />} />
                    </Routes>
                  </CustomerLayout>
                </ProtectedRoute>
              }
            />

            {/* Agent Routes */}
            <Route
              path="/agent/*"
              element={
                <ProtectedRoute allowedRoles={['DELIVERY_AGENT']}>
                  <AgentLayout>
                    <Routes>
                      <Route path="dashboard" element={<AgentDashboard />} />
                      <Route path="deliveries" element={<AssignedDeliveriesPage />} />
                      <Route path="deliveries/:id" element={<DeliveryDetailPage />} />
                      <Route path="history" element={<DeliveryHistoryPage />} />
                      <Route path="*" element={<Navigate to="/agent/dashboard" replace />} />
                    </Routes>
                  </AgentLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="orders" element={<AdminOrdersPage />} />
                      <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                      <Route path="agents" element={<AgentsPage />} />
                      <Route path="zones" element={<ZonesPage />} />
                      <Route path="zones/areas" element={<AreaMappingPage />} />
                      <Route path="rates" element={<RateCardsPage />} />
                      <Route path="rates/cod" element={<CodConfigPage />} />
                      <Route path="users" element={<UsersPage />} />
                      <Route path="notifications" element={<AdminNotificationsPage />} />
                      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
