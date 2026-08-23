import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { DashboardStats, Order } from '../../types';
import MetricCard from '../../components/dashboard/MetricCard';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then((statsData: any) => {
        setStats(statsData);
        if (Array.isArray(statsData?.recentOrders)) {
          setRecentOrders(statsData.recentOrders);
        }
      })
      .catch((err) => {
        console.error('[Admin Dashboard Load Error]', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const metrics = stats
    ? [
        { title: 'Total Orders', value: stats.totalOrders ?? 0, icon: <Package className="w-5 h-5" />, bg: 'bg-blue-100 text-blue-600', to: '/admin/orders' },
        { title: 'Pending (Created)', value: stats.pendingOrders ?? 0, icon: <Clock className="w-5 h-5" />, bg: 'bg-yellow-100 text-yellow-600', to: '/admin/orders?status=CREATED' },
        { title: 'In Transit', value: stats.inTransitOrders ?? 0, icon: <Truck className="w-5 h-5" />, bg: 'bg-purple-100 text-purple-600', to: '/admin/orders?status=IN_TRANSIT' },
        { title: 'Out for Delivery', value: stats.outForDeliveryOrders ?? 0, icon: <TrendingUp className="w-5 h-5" />, bg: 'bg-orange-100 text-orange-600', to: '/admin/orders' },
        { title: 'Delivered', value: stats.deliveredOrders ?? 0, icon: <CheckCircle className="w-5 h-5" />, bg: 'bg-green-100 text-green-600', to: '/admin/orders?status=DELIVERED' },
        { title: 'Failed', value: stats.failedOrders ?? 0, icon: <XCircle className="w-5 h-5" />, bg: 'bg-red-100 text-red-600', to: '/admin/orders?status=FAILED' },
        { title: 'Available Agents', value: stats.availableAgents ?? 0, icon: <Users className="w-5 h-5" />, bg: 'bg-teal-100 text-teal-600', to: '/admin/agents' },
        { title: 'Unassigned', value: stats.unassignedOrders ?? 0, icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-rose-100 text-rose-600', to: '/admin/orders' },
      ]
    : [];

  const quickLinks = [
    { label: 'Manage Orders', icon: <Package className="w-5 h-5" />, to: '/admin/orders', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { label: 'Manage Agents', icon: <Truck className="w-5 h-5" />, to: '/admin/agents', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
    { label: 'Zone Management', icon: <Package className="w-5 h-5" />, to: '/admin/zones', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
    { label: 'Rate Cards', icon: <Package className="w-5 h-5" />, to: '/admin/rates', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
    { label: 'COD Config', icon: <Package className="w-5 h-5" />, to: '/admin/rates/cod', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
    { label: 'Users', icon: <Users className="w-5 h-5" />, to: '/admin/users', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          System overview and quick logistics management
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.title}
            title={m.title}
            value={m.value}
            icon={m.icon}
            iconBg={m.bg}
            onClick={() => navigate(m.to)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Recent System Orders"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate('/admin/orders')}
                >
                  View all
                </Button>
              }
            />
            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Order', 'Customer', 'Status', 'Charge', 'Date'].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-xs text-gray-400">
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-3 font-medium text-gray-900">
                          #{order.orderNumber}
                        </td>
                        <td className="px-6 py-3 text-gray-600">
                          {order.customer?.name}
                        </td>
                        <td className="px-6 py-3">
                          <OrderStatusBadge status={order.status} />
                        </td>
                        <td className="px-6 py-3 font-medium">
                          {order.calculatedCharge !== undefined
                            ? formatCurrency(order.calculatedCharge)
                            : '—'}
                        </td>
                        <td className="px-6 py-3 text-gray-400 text-xs">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader title="Quick Links" />
          <div className="space-y-2">
            {quickLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => navigate(link.to)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${link.color}`}
              >
                {link.icon}
                {link.label}
                <ArrowRight className="w-4 h-4 ml-auto opacity-50" />
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
