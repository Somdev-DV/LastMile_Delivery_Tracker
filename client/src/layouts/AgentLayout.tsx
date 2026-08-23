import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  LayoutDashboard,
  Truck,
  History,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { formatRole } from '../utils/formatters';

interface LayoutProps {
  children: React.ReactNode;
}

export const AgentLayout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#191c1e] font-sans flex flex-col">
      {/* TopAppBar */}
      <header className="bg-white fixed top-0 w-full z-50 border-b border-[#c5c6cd]/50 shadow-2xs">
        <div className="flex justify-between items-center px-4 sm:px-8 py-3 w-full max-w-7xl mx-auto h-16">
          {/* Logo & Avatar */}
          <div
            onClick={() => navigate('/agent/dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-full bg-[#eceef0] overflow-hidden border border-[#c5c6cd]/80 shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuACm7vGmQSxe2m_anQ1OUecj4HnC6IdbE1AsDSd0sMajzPq1xNsnfxU31y63shX_IffSB_bup9tgHP3CXrzeUI7HNHzg5Jmly_92oDnaEY4FWjnHcm9u2Ntp97t7hygF8m8Xmy5Z2zjHA5j7XgDNwFQW1DE2wbaoaH7xGb1k89YOPAlZQ70L3mH4effIcSQcmdujhdcvKP3YpWz4pinzKmPbNZrRneFqqG-ofvveUSjYeKrHFJ0pxJsxQ"
                alt="Agent Profile"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-headline text-xl sm:text-2xl font-bold text-[#435c5b] leading-tight">
                LogisticsPro
              </span>
              <span className="text-[10px] font-semibold text-[#61611d] tracking-wider uppercase">
                Agent Terminal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex gap-2 items-center">
            <NavLink
              to="/agent/dashboard"
              end
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#eceef0] text-[#61611d] font-bold shadow-2xs'
                    : 'text-[#45474c] hover:bg-[#f2f4f6]'
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/agent/deliveries"
              end
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#eceef0] text-[#61611d] font-bold shadow-2xs'
                    : 'text-[#45474c] hover:bg-[#f2f4f6]'
                }`
              }
            >
              Assigned Deliveries
            </NavLink>

            <NavLink
              to="/agent/history"
              className={({ isActive }) =>
                `text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-[#eceef0] text-[#61611d] font-bold shadow-2xs'
                    : 'text-[#45474c] hover:bg-[#f2f4f6]'
                }`
              }
            >
              History
            </NavLink>
          </nav>

          {/* Right Actions: Status & Profile Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#defbf8] text-[#006444] rounded-full text-xs font-bold border border-[#006444]/20">
              <span className="w-2 h-2 rounded-full bg-[#006444] animate-pulse"></span>
              <span>Available</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg hover:bg-[#f2f4f6] transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-[#191c1e] leading-tight">{user?.name}</p>
                  <p className="text-[10px] text-[#75777d]">{formatRole(user?.role ?? '')}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#75777d]" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl shadow-lg border border-[#c5c6cd]/60 py-1">
                    <div className="px-4 py-2 border-b border-[#eceef0]">
                      <p className="text-xs font-bold text-[#191c1e] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#75777d] truncate">{user?.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
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
      <main className="flex-1 pt-24 pb-20 md:pb-12 max-w-7xl mx-auto px-4 md:px-8 w-full">
        {children}
      </main>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center bg-white py-2 px-4 z-50 border-t border-[#c5c6cd]/60 shadow-md">
        <NavLink
          to="/agent/dashboard"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-full px-3 py-1 text-xs transition-transform active:scale-95 ${
              isActive
                ? 'bg-[#e5e491] text-[#656621] font-bold'
                : 'text-[#45474c]'
            }`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Dash</span>
        </NavLink>

        <NavLink
          to="/agent/deliveries"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-full px-3 py-1 text-xs transition-transform active:scale-95 ${
              isActive
                ? 'bg-[#e5e491] text-[#656621] font-bold'
                : 'text-[#45474c]'
            }`
          }
        >
          <Truck className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">Deliveries</span>
        </NavLink>

        <NavLink
          to="/agent/history"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center rounded-full px-3 py-1 text-xs transition-transform active:scale-95 ${
              isActive
                ? 'bg-[#e5e491] text-[#656621] font-bold'
                : 'text-[#45474c]'
            }`
          }
        >
          <History className="w-4 h-4" />
          <span className="text-[10px] mt-0.5">History</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AgentLayout;
