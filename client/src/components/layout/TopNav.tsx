import React from 'react';
import { Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { formatRole } from '../../utils/formatters';

interface TopNavProps {
  onMenuClick: () => void;
  pageTitle?: string;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick, pageTitle }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-[#eceef0] px-4 lg:px-8 py-3">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-[#75777d] hover:bg-[#f2f4f6] lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        {pageTitle && (
          <h1 className="text-base font-bold text-[#191c1e] hidden sm:block">
            {pageTitle}
          </h1>
        )}

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => alert('No new unread notifications')}
            className="p-2 rounded-full text-[#435c5b] hover:bg-[#f2f4f6] transition-colors"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-[#f2f4f6] transition-colors"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border border-[#c5c6cd]/80 bg-[#eceef0] flex items-center justify-center">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6aVQryXt2mwWF2uaLMGTq1HhvjHilfpkDsxAfUtEd3lCNWRAK9in9k9Grqf4dkLWNIrCH7JcmCW5IIcBARBLJu4XWZupXqsd1IkplW9iLIowS4j_kLwUbx9O2yYLy0rqLhD88fNl3sgg6V7IZNEWhGzgeVHbjWZP4P7BVQjlVviKj06ZdsMf4AjUtM66SR1bO1GVXS0I92xxCRH7tJNGydKVdhBOWqW4XLLpC8LWJLu_FHvfFszSSng"
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#191c1e] leading-tight">{user?.name}</p>
                <p className="text-[11px] text-[#75777d]">{formatRole(user?.role ?? '')}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#75777d]" />
            </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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
  );
};

export default TopNav;
