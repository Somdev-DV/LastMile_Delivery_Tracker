import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  Truck,
  MapPin,
  Users,
  Bell,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { formatRole } from '../utils/formatters';

interface LayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-[#191c1e] font-sans flex flex-col">
      {/* Top Header */}
      <header className="bg-white sticky top-0 w-full z-50 border-b border-gray-200 shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-8 py-3 w-full max-w-7xl mx-auto h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
              LP
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                LogisticsPro
              </span>
              <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex gap-1 items-center">
            {[
              { to: '/admin/dashboard', label: 'Dashboard', end: true },
              { to: '/admin/orders', label: 'Orders', end: false },
              { to: '/admin/agents', label: 'Agents', end: false },
              { to: '/admin/zones', label: 'Zones', end: true },
              { to: '/admin/zones/areas', label: 'Area Mapping', end: true },
              { to: '/admin/rates', label: 'Rate Cards', end: true },
              { to: '/admin/rates/cod', label: 'COD Config', end: true },
              { to: '/admin/users', label: 'Users', end: false },
              { to: '/admin/notifications', label: 'Alerts', end: false },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Actions: Notifications & Profile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors p-2 rounded-full relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'Administrator'}</p>
                  <p className="text-[10px] text-gray-500">{formatRole(user?.role ?? 'ADMIN')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 max-w-7xl mx-auto px-4 md:px-8 w-full">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-2 px-2 z-50 border-t border-gray-200 shadow-md">
        {[
          { to: '/admin/dashboard', label: 'Dash', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/admin/orders', label: 'Orders', icon: <Package className="w-4 h-4" /> },
          { to: '/admin/agents', label: 'Agents', icon: <Truck className="w-4 h-4" /> },
          { to: '/admin/zones', label: 'Zones', icon: <MapPin className="w-4 h-4" /> },
          { to: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
        ].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center rounded-lg px-2.5 py-1 text-xs transition-colors ${
                isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
              }`
            }
          >
            {item.icon}
            <span className="text-[9px] mt-0.5">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminLayout;
