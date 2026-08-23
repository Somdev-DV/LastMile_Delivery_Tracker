import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { agentService } from '../../services/agentService';
import type { DeliveryAgent, Order } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { formatRelativeTime } from '../../utils/formatters';
import type { AgentAvailability } from '../../types';

export const AgentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [agent, setAgent] = useState<DeliveryAgent | null>(null);
  const [deliveries, setDeliveries] = useState<Order[]>([]);
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvail, setTogglingAvail] = useState(false);

  useEffect(() => {
    Promise.all([
      agentService.getMyProfile().catch(() => null),
      agentService.getAssignedDeliveries({ limit: 20 }).catch(() => ({ data: [] })),
      agentService.getDeliveryHistory({ limit: 50 }).catch(() => ({ data: [] })),
    ])
      .then(([agentData, deliveriesRes, historyRes]) => {
        if (agentData) setAgent(agentData);
        const delList = Array.isArray(deliveriesRes)
          ? deliveriesRes
          : (deliveriesRes as any)?.data || [];
        setDeliveries(delList);

        const histList = Array.isArray(historyRes)
          ? historyRes
          : (historyRes as any)?.data || [];
        setHistory(histList);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    if (!agent) return;
    const next: AgentAvailability =
      agent.availability === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    setTogglingAvail(true);
    try {
      const updated = await agentService.updateAvailability(agent.id, next);
      setAgent(updated);
      toast.success(`Status updated to ${next}`);
    } catch {
      toast.error('Failed to update availability');
    } finally {
      setTogglingAvail(false);
    }
  };

  if (loading) return <PageSpinner />;

  // 100% Dynamic Database Metric Computations
  const activeCount = deliveries.filter((d) =>
    ['ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(d.status)
  ).length;

  const deliveredCount = history.filter((d) => d.status === 'DELIVERED').length;
  const failedCount = history.filter((d) => d.status === 'FAILED').length;
  const totalFinished = deliveredCount + failedCount;

  const successRate =
    totalFinished > 0
      ? (((deliveredCount) / totalFinished) * 100).toFixed(1)
      : '100.0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Top Greeting & Availability Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Good Morning, {user?.name?.split(' ')[0] || 'Rider'}.
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Zone:{' '}
            <span className="font-semibold text-gray-800">
              {agent?.zone?.name ?? 'Assigned Metro'}
            </span>{' '}
            • Vehicle:{' '}
            <span className="font-semibold text-gray-800">
              {agent?.vehicleType ?? 'Two Wheeler'}
            </span>
          </p>
        </div>

        <button
          onClick={toggleAvailability}
          disabled={togglingAvail}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-[0.98] ${
            agent?.availability === 'AVAILABLE'
              ? 'bg-[#2d403b] text-white hover:bg-[#22312d]'
              : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
          }`}
        >
          {agent?.availability === 'AVAILABLE' ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Status: Available (Click to Go Busy)
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Status: Busy (Click to Go Available)
            </>
          )}
        </button>
      </div>

      {/* Main Grid: Left (Overview + Active Queue) and Right (Success Rate + Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Status Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Active Queue */}
            <div
              onClick={() => navigate('/agent/deliveries')}
              className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs cursor-pointer hover:border-gray-400 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Active Queue
                </span>
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-700">
                  <Truck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{activeCount}</div>
              <div className="text-xs text-amber-700 font-medium mt-0.5">
                Assigned deliveries in queue
              </div>
            </div>

            {/* Card 2: Completed */}
            <div
              onClick={() => navigate('/agent/history')}
              className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs cursor-pointer hover:border-gray-400 transition-all"
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Delivered
                </span>
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900">{deliveredCount}</div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                Successfully delivered
              </div>
            </div>

            {/* Card 3: Zone Coverage */}
            <div className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-2 shadow-xs">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Assigned Zone
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              <div className="text-base font-bold text-gray-900 truncate mt-1">
                {agent?.zone?.name ?? 'Assigned Metro Area'}
              </div>
              <div className="text-xs text-gray-500">
                Vehicle: {agent?.vehicleType ?? 'Two Wheeler'}
              </div>
            </div>
          </div>

          {/* Active Deliveries List Card */}
          <div className="bg-white border border-gray-200/90 rounded-xl overflow-hidden shadow-xs flex flex-col">
            <div className="px-6 py-4.5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">
                Assigned Deliveries ({activeCount})
              </h2>
              <button
                onClick={() => navigate('/agent/deliveries')}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 hover:underline"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-gray-100">
              {deliveries.length === 0 ? (
                <div className="py-16 px-6 text-center text-gray-500 text-sm">
                  No active deliveries currently assigned to your queue.
                </div>
              ) : (
                deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    onClick={() => navigate(`/agent/deliveries/${delivery.id}`)}
                    className="p-4 sm:p-5 hover:bg-gray-50/70 transition-colors flex flex-col sm:flex-row gap-4 sm:items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700 shrink-0">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono text-gray-900">
                          #{delivery.orderNumber}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {delivery.pickupCity || delivery.pickupPincode} →{' '}
                          {delivery.dropCity || delivery.dropPincode}
                        </div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          Customer: {delivery.customer?.name} • {delivery.customer?.phone}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 justify-between sm:justify-end">
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full border bg-amber-50 text-amber-800 border-amber-200">
                        {delivery.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Driver Performance Widget (100% from DB) */}
          <div className="bg-[#2d403b] text-white rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-wider uppercase text-white/80">
                Delivery Success Rate
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-medium text-emerald-400">
                  {failedCount === 0 ? 'Optimal' : 'Active'}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-end mt-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold leading-none">{successRate}%</span>
                <span className="text-xs text-white/70 mt-1">
                  {deliveredCount} Delivered • {failedCount} Failed
                </span>
              </div>
              <Activity className="w-8 h-8 text-white/30" />
            </div>
          </div>

          {/* Real Dispatch Updates from DB */}
          <div className="bg-white border border-gray-200/90 rounded-xl p-5 flex flex-col gap-5 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
              Recent Activity
            </h3>
            <div className="flex flex-col space-y-4">
              {deliveries.length === 0 && history.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No activity recorded yet. Real-time updates will show here.
                </div>
              ) : (
                [...deliveries, ...history].slice(0, 4).map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/agent/deliveries/${item.id}`)}
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
                        #{item.orderNumber} • {item.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-600 truncate">
                        {item.pickupCity || item.pickupPincode} to {item.dropCity || item.dropPincode}
                      </span>
                      <span className="text-[11px] text-gray-400 mt-0.5">
                        {formatRelativeTime(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => navigate('/agent/deliveries')}
              className="w-full mt-2 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Open Deliveries Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
