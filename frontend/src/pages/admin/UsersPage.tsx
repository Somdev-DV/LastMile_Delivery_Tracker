import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { User, Role } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { Users } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const UsersPage: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const roleParam = roleFilter !== 'ALL' ? (roleFilter as Role) : undefined;
      const list = await adminService.getAllUsers(roleParam);
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[Users Fetch Error]', err);
      showToast('error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const columns = [
    {
      key: 'name',
      header: 'User Profile',
      render: (u: User) => (
        <div>
          <p className="font-semibold text-gray-900 text-sm">{u.name}</p>
          <p className="text-xs text-gray-500">{u.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'System Role',
      render: (u: User) => {
        const colors: Record<Role, string> = {
          ADMIN: 'bg-purple-100 text-purple-800',
          DELIVERY_AGENT: 'bg-green-100 text-green-800',
          CUSTOMER: 'bg-blue-100 text-blue-800',
        };
        return (
          <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${colors[u.role]}`}>
            {u.role}
          </span>
        );
      },
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (u: User) => <span className="text-xs text-gray-600">{u.phone || 'N/A'}</span>,
    },
    {
      key: 'createdAt',
      header: 'Registered',
      render: (u: User) => <span className="text-xs text-gray-500">{formatDateTime(u.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" /> Platform Users
          </h1>
          <p className="text-sm text-gray-500">Manage accounts across Customers, Agents, and Administrators</p>
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3 py-2 border rounded-md text-sm bg-white"
        >
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="DELIVERY_AGENT">Delivery Agents</option>
          <option value="ADMIN">Administrators</option>
        </select>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={users} keyExtractor={(u) => u.id} />
        )}
      </Card>
    </div>
  );
};

export default UsersPage;
