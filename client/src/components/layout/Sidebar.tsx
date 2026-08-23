import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  MapPin,
  Bell,
  User,
  X,
  Truck,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  end?: boolean;
}

interface SidebarProps {
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const customerNavItems: NavItem[] = [
  {
    to: '/customer/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/customer/orders/create',
    label: 'Create Order',
    icon: <PlusCircle className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/customer/orders',
    label: 'My Orders',
    icon: <Package className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/customer/notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/customer/profile',
    label: 'Profile',
    icon: <User className="w-5 h-5" />,
    end: true,
  },
];

export const agentNavItems: NavItem[] = [
  {
    to: '/agent/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/agent/deliveries',
    label: 'Assigned Deliveries',
    icon: <Truck className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/agent/history',
    label: 'Delivery History',
    icon: <Package className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/agent/profile',
    label: 'My Profile',
    icon: <User className="w-5 h-5" />,
    end: true,
  },
];

export const adminNavItems: NavItem[] = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: <Package className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/agents',
    label: 'Agents',
    icon: <Truck className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/zones',
    label: 'Zones',
    icon: <MapPin className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/zones/areas',
    label: 'Area Mapping',
    icon: <MapPin className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/rates',
    label: 'Rate Cards',
    icon: <Package className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/rates/cod',
    label: 'COD Config',
    icon: <Package className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/users',
    label: 'Users',
    icon: <User className="w-5 h-5" />,
    end: true,
  },
  {
    to: '/admin/notifications',
    label: 'Notifications',
    icon: <Bell className="w-5 h-5" />,
    end: true,
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  navItems,
  title,
  subtitle,
  isOpen = true,
  onClose,
}) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#eceef0]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#435c5b] rounded-lg flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-[#435c5b] text-base tracking-tight">LogisticsPro</span>
            </div>
            {subtitle && (
              <p className="text-[11px] font-medium text-[#75777d] mt-1 ml-10">{subtitle}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
