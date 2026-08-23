import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Package, ArrowRight, Filter } from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency, formatWeight } from '../../utils/formatters';

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

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    orderService
      .getMyOrders({ page, limit: 12, status: status || undefined, search: search || undefined })
      .then((res) => {
        setOrders(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, status, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-2 border-b border-[#c5c6cd]/40">
        <div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold text-[#435c5b] tracking-tight">
            My Shipments
          </h1>
          <p className="text-sm text-[#45474c] mt-1">{total} total shipments recorded</p>
        </div>
        <button
          onClick={() => navigate('/customer/orders/create')}
          className="bg-[#435c5b] hover:bg-[#354a49] text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm shadow-[#435c5b]/10 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Order
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3 bg-white border border-[#c5c6cd]/60 p-3 rounded-xl shadow-2xs">
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#75777d]" />
          <input
            type="text"
            placeholder="Search by tracking number, address..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[#f7f9fb] border border-[#c5c6cd]/80 rounded-lg py-2 pl-9 pr-3 text-xs text-[#191c1e] placeholder-[#75777d] focus:outline-none focus:border-[#435c5b] focus:ring-1 focus:ring-[#435c5b]"
          />
        </div>
        <div className="min-w-[180px]">
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="w-full bg-[#f7f9fb] border border-[#c5c6cd]/80 rounded-lg py-2 px-3 text-xs text-[#191c1e] focus:outline-none focus:border-[#435c5b]"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <PageSpinner />
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-12 text-center shadow-sm">
          <Package className="w-12 h-12 text-[#75777d] mx-auto mb-3 opacity-40" />
          <h3 className="font-headline text-base font-bold text-[#191c1e] mb-1">No Shipments Found</h3>
          <p className="text-xs text-[#45474c] max-w-sm mx-auto mb-5">
            {search || status ? 'Try adjusting your search criteria or status filter.' : 'You have not created any delivery orders yet.'}
          </p>
          <button
            onClick={() => navigate('/customer/orders/create')}
            className="bg-[#435c5b] text-white text-xs font-semibold px-4 py-2 rounded-lg"
          >
            Create First Order
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {orders.map((order) => {
            const isDelayed = ['FAILED', 'RETURNED'].includes(order.status);
            const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.status);
            const isDelivered = order.status === 'DELIVERED';
            return (
              <div
                key={order.id}
                onClick={() => navigate(`/customer/orders/${order.id}`)}
                className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 shadow-sm hover:shadow-md hover:border-[#435c5b]/40 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-mono text-xs font-bold text-[#191c1e]">
                      #{order.orderNumber}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isDelivered
                          ? 'bg-[#defbf8] text-[#006444] border-[#006444]/20'
                          : isDelayed
                          ? 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]'
                          : isInTransit
                          ? 'bg-[#e5e491]/40 text-[#61611d] border-[#e5e491]'
                          : 'bg-[#eceef0] text-[#45474c] border-[#c5c6cd]'
                      }`}
                    >
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="text-[#191c1e] font-semibold flex items-center gap-1.5">
                      <span>{order.pickupCity || order.pickupPincode}</span>
                      <span className="text-[#75777d]">➔</span>
                      <span>{order.dropCity || order.dropPincode}</span>
                    </div>
                    <div className="text-[11px] text-[#75777d]">
                      Weight: {formatWeight(order.actualWeight || 1)} • {order.orderType}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#eceef0] pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-[#75777d] block uppercase tracking-wider">Estimated Fee</span>
                    <span className="text-xs font-bold text-[#435c5b]">
                      {order.calculatedCharge ? formatCurrency(order.calculatedCharge) : '—'}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-[#435c5b] flex items-center gap-1 hover:underline">
                    Track <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="flex justify-center items-center gap-3 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 border border-[#c5c6cd]/80 rounded-lg text-xs font-semibold text-[#45474c] disabled:opacity-40 hover:bg-[#f2f4f6]"
          >
            Previous
          </button>
          <span className="text-xs font-medium text-[#75777d]">
            Page {page} of {Math.ceil(total / 12)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 12)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-[#c5c6cd]/80 rounded-lg text-xs font-semibold text-[#45474c] disabled:opacity-40 hover:bg-[#f2f4f6]"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
