import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Bell,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { formatRole } from '../utils/formatters';

interface LayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fcfdfd] text-[#191c1e] font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white sticky top-0 w-full z-50 border-b border-gray-200/80 shadow-xs">
        <div className="flex justify-between items-center px-4 sm:px-8 py-3 w-full max-w-7xl mx-auto h-16">
          {/* Left: Logo & Brand */}
          <div
            onClick={() => navigate('/customer/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-gray-200 shrink-0 flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="LogisticsPro"
                className="object-cover w-full h-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              LogisticsPro
            </span>
          </div>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex gap-1.5 items-center bg-transparent">
            <NavLink
              to="/customer/dashboard"
              end
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/customer/orders"
              end
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Shipments
            </NavLink>

            <NavLink
              to="/customer/orders/create"
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Create Order
            </NavLink>

            <NavLink
              to="/customer/profile"
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-bold shadow-xs'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              Profile
            </NavLink>
          </nav>

          {/* Right: Notifications & Profile Menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/customer/notifications')}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors p-2 rounded-full relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2.5 py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-gray-900 leading-tight">
                    {user?.name || 'Rahul Sharma'}
                  </p>
                  <p className="text-[11px] text-gray-500">{formatRole(user?.role ?? 'CUSTOMER')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/customer/profile');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Manage Profile
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors border-t border-gray-50"
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
      <main className="flex-1 py-8 max-w-7xl mx-auto px-4 md:px-8 w-full">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-2.5 px-4 z-50 border-t border-gray-200 shadow-lg">
        <NavLink
          to="/customer/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-lg px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dash</span>
        </NavLink>

        <NavLink
          to="/customer/orders"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-lg px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <Package className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Shipments</span>
        </NavLink>

        <NavLink
          to="/customer/orders/create"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-lg px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <PlusCircle className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Create</span>
        </NavLink>

        <NavLink
          to="/customer/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-lg px-3 py-1 text-xs transition-colors ${
              isActive ? 'text-blue-600 font-bold' : 'text-gray-500'
            }`
          }
        >
          <User className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default CustomerLayout;
