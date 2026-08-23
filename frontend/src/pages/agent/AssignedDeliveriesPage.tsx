import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Package, ArrowRight } from 'lucide-react';
import { agentService } from '../../services/agentService';
import type { Order } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';

export const AssignedDeliveriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetch = useCallback(() => {
    setLoading(true);
    agentService
      .getAssignedDeliveries({ limit: 50 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res as any)?.data || [];
        setDeliveries(list);
        setTotal(list.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="border-b border-gray-200 pb-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Assigned Deliveries
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {total} package{total !== 1 ? 's' : ''} assigned to your current route in database
        </p>
      </div>

      {deliveries.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-xs">
          <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
          <h3 className="text-base font-bold text-gray-900 mb-1">
            No Deliveries Assigned
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            When dispatch assigns packages to your route, they will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((delivery) => {
            const isDelivered = delivery.status === 'DELIVERED';
            const isFailed = delivery.status === 'FAILED';
            const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(delivery.status);
            return (
              <div
                key={delivery.id}
                onClick={() => navigate(`/agent/deliveries/${delivery.id}`)}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:shadow-sm hover:border-gray-400 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-900">
                        #{delivery.orderNumber}
                      </span>
                    </div>

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
                      {delivery.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <p className="text-[11px] text-gray-500">
                      Customer: <span className="font-semibold text-gray-900">{delivery.customer?.name}</span> • {delivery.customer?.phone}
                    </p>

                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-900">
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                        <span className="font-semibold truncate">{delivery.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-blue-700">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span className="font-semibold truncate">{delivery.dropAddress}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-xs">
                  <span className="text-[11px] text-gray-500">
                    {delivery.orderType} • {delivery.paymentType}
                  </span>
                  <button className="text-xs font-semibold text-gray-900 hover:underline flex items-center gap-1">
                    Manage Delivery <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveriesPage;
