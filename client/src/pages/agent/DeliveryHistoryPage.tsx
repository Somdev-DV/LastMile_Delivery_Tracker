import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { agentService } from '../../services/agentService';
import type { Order } from '../../types';
import OrderStatusBadge from '../../components/orders/OrderStatusBadge';
import Card from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const DeliveryHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetch = useCallback(() => {
    setLoading(true);
    agentService
      .getDeliveryHistory({ page, limit: 20 })
      .then((res) => {
        setOrders(Array.isArray(res?.data) ? res.data : []);
        setTotal(res?.total ?? 0);
      })
      .catch(() => {
        setOrders([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery History</h1>
        <p className="text-gray-500 text-sm mt-1">{total} completed deliveries</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No delivery history"
          description="Completed deliveries will appear here."
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  {['Order #', 'Customer', 'Route', 'Type', 'Status', 'Charge', 'Date'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => navigate(`/agent/deliveries/${order.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">#{order.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{order.customer?.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {order.pickupCity || order.pickupPincode} → {order.dropCity || order.dropPincode}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{order.orderType}</td>
                    <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 font-medium">
                      {order.calculatedCharge !== undefined ? formatCurrency(order.calculatedCharge) : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {formatDateTime(order.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-3">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {page} of {Math.ceil(total / 20)}
              </span>
              <button
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default DeliveryHistoryPage;
