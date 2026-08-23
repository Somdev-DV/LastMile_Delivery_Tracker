import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  ArrowRight,
  Clock,
  Truck,
  AlertTriangle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency, formatRelativeTime } from '../../utils/formatters';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getMyOrders({ limit: 50 })
      .then((res) => {
        const items = Array.isArray(res) ? res : res?.data || [];
        setOrders(items);
      })
      .catch((err) => {
        console.error('[Dashboard Orders Fetch Error]', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 100% Dynamic Database Metric Computations
  const pendingCount = orders.filter((o) =>
    ['CREATED', 'ASSIGNED'].includes(o.status)
  ).length;

  const activeCount = orders.filter((o) =>
    ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
  ).length;

  const exceptionCount = orders.filter((o) =>
    ['FAILED', 'CANCELLED'].includes(o.status)
  ).length;

  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalCount = orders.length;

  // On-time rate computed strictly from database records
  const onTimeRate =
    totalCount > 0
      ? (((totalCount - exceptionCount) / totalCount) * 100).toFixed(1)
      : '100.0';

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Greeting & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Good Morning, {user?.name?.split(' ')[0] || 'Rahul'}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Here is the current status of your delivery network.
          </p>
        </div>
        <button
          onClick={() => navigate('/customer/orders/create')}
          className="bg-[#2d403b] hover:bg-[#22312d] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Order
        </button>
      </div>

      {/* Main Grid: 4 Metric Cards (All strictly from DB) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending */}
        <div
          onClick={() => navigate('/customer/orders')}
          className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs cursor-pointer hover:border-gray-400 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Pending
            </span>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pendingCount}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <span>Awaiting pickup & dispatch</span>
          </div>
        </div>

        {/* Card 2: Active */}
        <div
          onClick={() => navigate('/customer/orders')}
          className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs cursor-pointer hover:border-gray-400 transition-all"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Active
            </span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{activeCount}</div>
          <div className="text-xs text-emerald-700 font-medium mt-0.5">In transit now</div>
        </div>

        {/* Card 3: Action Required */}
        <div
          onClick={() => navigate('/customer/orders')}
          className="bg-white border border-red-200 rounded-xl p-5 flex flex-col gap-2 shadow-xs relative overflow-hidden cursor-pointer hover:shadow-sm transition-all"
        >
          <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-red-700 uppercase tracking-wider">
              Action Required
            </span>
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{exceptionCount}</div>
          <div className="text-xs text-red-600 font-medium mt-0.5">
            {exceptionCount === 0 ? 'No exceptions detected' : 'Requires rescheduling/review'}
          </div>
        </div>

        {/* Card 4: Network Status */}
        <div className="bg-[#2d403b] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white/80">
              Network Status
            </h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-xs font-medium text-emerald-400">
                {exceptionCount === 0 ? 'Optimal' : 'Attention'}
              </span>
            </div>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold leading-none">{onTimeRate}%</span>
              <span className="text-xs text-white/70 mt-1">Delivery Success Rate</span>
            </div>
            <Activity className="w-8 h-8 text-white/30" />
          </div>
        </div>
      </div>

      {/* Main Content Split: Left (Active Shipments) and Right (Recent Updates) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left 8 Cols: Active Shipments */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">
                Active Shipments ({orders.length})
              </h2>
              <button
                onClick={() => navigate('/customer/orders')}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {orders.length === 0 ? (
                <div className="py-16 px-6 text-center text-gray-500 text-sm">
                  No orders found in your account. Click "Create New Order" to start.
                </div>
              ) : (
                orders.slice(0, 5).map((order) => {
                  const isFailed = order.status === 'FAILED';
                  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.status);
                  const isDelivered = order.status === 'DELIVERED';
                  return (
                    <div
                      key={order.id}
                      onClick={() => navigate(`/customer/orders/${order.id}/track`)}
                      className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center border shrink-0 ${
                            isFailed
                              ? 'bg-red-50 border-red-100 text-red-600'
                              : isDelivered
                              ? 'bg-green-50 border-green-100 text-green-600'
                              : 'bg-gray-100 border-gray-200 text-gray-700'
                          }`}
                        >
                          {isFailed ? (
                            <AlertTriangle className="w-5 h-5" />
                          ) : isDelivered ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <Package className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {order.pickupCity || order.pickupPincode} → {order.dropCity || order.dropPincode}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                        <div className="text-right">
                          <span className="text-[11px] text-gray-400 block">Delivery Charge</span>
                          <span className="text-xs font-semibold text-gray-900">
                            {order.calculatedCharge ? formatCurrency(order.calculatedCharge) : '—'}
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${
                            isFailed
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isDelivered
                              ? 'bg-green-50 text-green-800 border-green-200'
                              : isInTransit
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Recent Real Updates from DB */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Recent Updates
            </h3>
            <div className="flex flex-col space-y-4">
              {orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No activity recorded yet. Real-time updates will show here.
                </div>
              ) : (
                orders.slice(0, 4).map((order, idx) => (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/customer/orders/${order.id}/track`)}
                    className="flex gap-3 cursor-pointer hover:bg-gray-50/80 p-1.5 rounded-lg transition-colors"
                  >
                    <div
                      className={`w-6 h-6 rounded-full bg-white border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        idx === 0 ? 'border-[#2d403b]' : 'border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-[#2d403b]' : 'bg-gray-400'
                        }`}
                      ></div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-xs font-bold text-gray-900 truncate">
                        #{order.orderNumber} • {order.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-600 truncate">
                        {order.pickupCity || order.pickupPincode} to {order.dropCity || order.dropPincode}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {formatRelativeTime(order.updatedAt || order.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/customer/orders')}
              className="w-full mt-2 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              View All Orders Log
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
