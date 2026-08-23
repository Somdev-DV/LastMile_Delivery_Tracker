import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Search, X } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { zoneService } from '../../services/zoneService';
import type { Order, Zone } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency } from '../../utils/formatters';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const AdminOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [zoneId, setZoneId] = useState('');

  useEffect(() => {
    zoneService
      .getZones()
      .then((list) => {
        setZones(Array.isArray(list) ? list : []);
      })
      .catch(() => setZones([]));
  }, []);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderService
      .getOrders({
        page,
        limit: 15,
        status: status || undefined,
        pickupZoneId: zoneId || undefined,
        search: search || undefined,
      })
      .then((res) => {
        setOrders(Array.isArray(res?.data) ? res.data : []);
        setTotal(res?.total ?? 0);
      })
      .catch(() => {
        setOrders([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [page, status, zoneId, search]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const zoneOptions = [
    { value: '', label: 'All Zones' },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ];

  const reset = () => {
    setSearch('');
    setStatus('');
    setZoneId('');
    setPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            System Orders
          </h1>
          <p className="text-sm text-gray-500 mt-1">{total} total orders across network</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-white border border-gray-200 p-3 rounded-xl shadow-xs items-center">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order number, customer name..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-9 pr-3 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-500"
          />
        </div>
        <div className="min-w-[160px]">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-gray-500"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[160px]">
          <select
            value={zoneId}
            onChange={(e) => {
              setZoneId(e.target.value);
              setPage(1);
            }}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 px-3 text-xs text-gray-900 focus:outline-none focus:border-gray-500"
          >
            {zoneOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {(search || status || zoneId) && (
          <button
            onClick={reset}
            className="px-3 py-2 border border-gray-200 text-xs font-semibold text-gray-500 rounded-lg hover:bg-gray-50 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Orders Table Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12">
            <PageSpinner />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Order Number</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Route</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Agent</th>
                  <th className="px-5 py-3.5">Charge</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const isDelivered = o.status === 'DELIVERED';
                  const isFailed = o.status === 'FAILED';
                  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(o.status);
                  return (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/admin/orders/${o.id}`)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-gray-900">
                        #{o.orderNumber}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {o.customer?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">
                        {o.pickupZone?.name ?? o.pickupPincode} →{' '}
                        {o.dropZone?.name ?? o.dropPincode}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isDelivered
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isFailed
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : isInTransit
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {o.assignedAgent?.user?.name ? (
                          <span className="font-semibold text-gray-900">
                            {o.assignedAgent.user.name}
                          </span>
                        ) : (
                          <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-gray-900">
                        {o.calculatedCharge !== undefined
                          ? formatCurrency(o.calculatedCharge)
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {formatDateTime(o.createdAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/orders/${o.id}`);
                          }}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 15 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of{' '}
              {total} orders
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-white"
              >
                Previous
              </button>
              <button
                disabled={page >= Math.ceil(total / 15)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold disabled:opacity-40 hover:bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;
