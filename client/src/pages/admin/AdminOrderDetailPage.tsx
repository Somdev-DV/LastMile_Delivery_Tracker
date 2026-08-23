import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { agentService } from '../../services/agentService';
import { adminService } from '../../services/adminService';
import type { Order, DeliveryAgent, OrderStatus } from '../../types';
import PriceBreakdown from '../../components/orders/PriceBreakdown';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ui/Toast';
import { formatDateTime, formatWeight, formatCurrency } from '../../utils/formatters';
import {
  Truck,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  MapPin,
  Package,
  Phone,
  RotateCcw,
} from 'lucide-react';

export const AdminOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, toast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // Modals
  const [showManualModal, setShowManualModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [overrideStatus, setOverrideStatus] = useState<OrderStatus>('DELIVERED');
  const [overrideRemarks, setOverrideRemarks] = useState('');

  const fetchOrder = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await orderService.getOrder(id);
      setOrder(res);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const list = await agentService.getAgents({ limit: 50 });
      setAgents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchAgents();
  }, [id]);

  const handleAutoAssign = async () => {
    if (!id) return;
    try {
      setAssigning(true);
      const res = await agentService.autoAssign(id);
      toast.success(res.reasoning || 'Auto-assignment successful');
      fetchOrder();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Auto-assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleManualAssign = async () => {
    if (!id || !selectedAgentId) return;
    try {
      setAssigning(true);
      await agentService.assignAgent(id, selectedAgentId);
      toast.success('Agent assigned successfully');
      setShowManualModal(false);
      fetchOrder();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleOverrideStatus = async () => {
    if (!id) return;
    try {
      await adminService.overrideStatus(id, overrideStatus, overrideRemarks);
      toast.success('Order status overridden successfully');
      setShowOverrideModal(false);
      fetchOrder();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message || 'Override failed');
    }
  };

  if (loading) return <PageSpinner />;

  if (!order) {
    return (
      <div className="text-center py-20 font-sans">
        <p className="text-[#ba1a1a] text-sm">Order not found.</p>
        <button
          className="mt-4 px-4 py-2 bg-[#435c5b] text-white text-xs font-semibold rounded-lg"
          onClick={() => navigate('/admin/orders')}
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const isDelivered = order.status === 'DELIVERED';
  const isFailed = ['FAILED', 'RETURNED'].includes(order.status);
  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-[#c5c6cd]/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/orders')}
            className="p-2 rounded-lg border border-[#c5c6cd]/60 hover:bg-[#f2f4f6] text-[#45474c] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-headline text-xl sm:text-2xl font-bold text-[#435c5b] tracking-tight">
                Order #{order.orderNumber}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                  isDelivered
                    ? 'bg-[#defbf8] text-[#006444] border-[#006444]/20'
                    : isFailed
                    ? 'bg-[#ffdad6] text-[#93000a] border-[#ffdad6]'
                    : isInTransit
                    ? 'bg-[#e5e491]/40 text-[#61611d] border-[#e5e491]'
                    : 'bg-[#eceef0] text-[#45474c] border-[#c5c6cd]'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-[#75777d] mt-0.5">
              Created on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-2">
          {(order.status === 'CREATED' || order.status === 'RESCHEDULED') && (
            <>
              <button
                onClick={() => setShowManualModal(true)}
                className="px-3.5 py-2 border border-[#c5c6cd] text-xs font-semibold rounded-lg hover:bg-[#f2f4f6] flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#435c5b]" /> Manual Assign
              </button>
              <button
                onClick={handleAutoAssign}
                disabled={assigning}
                className="px-3.5 py-2 bg-[#435c5b] hover:bg-[#354a49] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" /> Auto-Assign Nearest
              </button>
            </>
          )}
          <button
            onClick={() => setShowOverrideModal(true)}
            className="px-3.5 py-2 border border-[#ba1a1a] text-[#ba1a1a] hover:bg-[#ffdad6]/30 text-xs font-semibold rounded-lg flex items-center gap-1.5"
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Override Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Route, Customer, and Audit */}
        <div className="lg:col-span-7 space-y-6">
          {/* Route Card */}
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#75777d] uppercase tracking-wider mb-4">
              Delivery Route & Customer
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-[#435c5b] before:to-[#0058be]">
              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#435c5b] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#435c5b]"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#435c5b] block">
                  Pickup Location
                </span>
                <p className="text-xs font-semibold text-[#191c1e] mt-0.5">{order.pickupAddress}</p>
                <p className="text-[11px] text-[#75777d]">
                  {order.pickupCity && `${order.pickupCity}, `}{order.pickupPincode} • Zone: {order.pickupZone?.name || 'Unassigned'}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-[#0058be] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#0058be]"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0058be] block">
                  Drop Location
                </span>
                <p className="text-xs font-semibold text-[#191c1e] mt-0.5">{order.dropAddress}</p>
                <p className="text-[11px] text-[#75777d]">
                  {order.dropCity && `${order.dropCity}, `}{order.dropPincode} • Zone: {order.dropZone?.name || 'Unassigned'}
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#eceef0] flex justify-between items-center text-xs">
              <div>
                <span className="text-[#75777d]">Customer: </span>
                <span className="font-semibold text-[#191c1e]">{order.customer?.name}</span> ({order.customer?.email})
              </div>
              <div className="text-[#75777d]">
                Phone: <span className="font-semibold text-[#191c1e]">{order.customer?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#75777d] uppercase tracking-wider mb-4">
              Immutable Tracking Audit Trail
            </h3>
            <TrackingTimeline
              events={order.trackingEvents || []}
              currentStatus={order.status}
            />
          </div>

          {/* Delivery Attempts */}
          {order.attempts && order.attempts.length > 0 && (
            <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 shadow-sm">
              <h3 className="text-xs font-bold text-[#75777d] uppercase tracking-wider mb-4">
                Delivery Attempt Log ({order.attempts.length})
              </h3>
              <div className="space-y-3">
                {order.attempts.map((attempt) => (
                  <div key={attempt.id} className="p-3 bg-[#f7f9fb] rounded-lg border border-[#eceef0] text-xs flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#191c1e]">Attempt #{attempt.attemptNumber}</span>
                      <span className={`ml-2 px-2 py-0.5 text-[10px] rounded-full font-semibold ${
                        attempt.status === 'COMPLETED' ? 'bg-[#defbf8] text-[#006444]' :
                        attempt.status === 'FAILED' ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e5e491]/30 text-[#61611d]'
                      }`}>
                        {attempt.status}
                      </span>
                      {attempt.failureReason && (
                        <p className="text-[11px] text-[#ba1a1a] mt-1">Reason: {attempt.failureReason}</p>
                      )}
                    </div>
                    <div className="text-[11px] text-[#75777d] text-right">
                      <p>Agent: {attempt.agent?.user?.name || 'Assigned Agent'}</p>
                      <p>{formatDateTime(attempt.startedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Cost Breakdown & Driver */}
        <div className="lg:col-span-5 space-y-6">
          <PriceBreakdown
            breakdown={{
              actualWeight: order.actualWeight,
              volumetricWeight: order.volumetricWeight,
              billableWeight: order.billableWeight,
              pickupZone: order.pickupZone?.name || order.pickupPincode,
              dropZone: order.dropZone?.name || order.dropPincode,
              routeType: order.pickupZoneId === order.dropZoneId ? 'INTRA_ZONE' : 'INTER_ZONE',
              orderType: order.orderType,
              paymentType: order.paymentType,
              baseRate: order.baseRate || 0,
              weightCharge: order.weightCharge || 0,
              codSurcharge: order.codSurcharge || 0,
              totalCharge: order.calculatedCharge || 0,
              rateCardId: '',
            }}
          />

          {/* Assigned Driver Card */}
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#75777d] uppercase tracking-wider mb-4">
              Assigned Fleet Agent
            </h3>
            {order.assignedAgent ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-sm text-[#191c1e]">{order.assignedAgent.user?.name}</p>
                <p className="text-[#45474c]">Email: {order.assignedAgent.user?.email}</p>
                <p className="text-[#45474c]">Phone: {order.assignedAgent.user?.phone || 'N/A'}</p>
                <p className="text-[#45474c]">Zone: {order.assignedAgent.zone?.name || 'All'}</p>
                <div className="pt-2">
                  <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#e5e491]/40 text-[#61611d]">
                    Status: {order.assignedAgent.availability}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-[#75777d] text-xs">
                No delivery agent currently assigned.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Manual Assign Modal */}
      <Modal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        title="Manually Assign Delivery Agent"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-xs text-[#45474c]">Select an available delivery agent from the fleet:</p>
          <select
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            className="w-full p-2.5 bg-[#f7f9fb] border border-[#c5c6cd]/80 rounded-lg text-xs"
          >
            <option value="">-- Choose an Agent --</option>
            {agents
              .filter((a) => a.availability === 'AVAILABLE' && a.isActive)
              .map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.user?.name} ({agent.zone?.name || 'No Zone'}) — {agent.availability}
                </option>
              ))}
          </select>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setShowManualModal(false)}
              className="px-4 py-2 border border-[#c5c6cd] text-xs font-semibold rounded-lg hover:bg-[#f2f4f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleManualAssign}
              disabled={assigning || !selectedAgentId}
              className="px-4 py-2 bg-[#435c5b] hover:bg-[#354a49] text-white text-xs font-semibold rounded-lg disabled:opacity-40"
            >
              Confirm Assignment
            </button>
          </div>
        </div>
      </Modal>

      {/* Override Status Modal */}
      <Modal
        isOpen={showOverrideModal}
        onClose={() => setShowOverrideModal(false)}
        title="Admin Status Override"
      >
        <div className="space-y-4 font-sans text-xs">
          <p className="text-xs text-[#ba1a1a] bg-[#ffdad6]/40 p-2.5 rounded-lg">
            Warning: Overriding status creates an immutable audit event recording your admin credentials.
          </p>
          <div>
            <label className="block text-xs font-semibold text-[#191c1e] mb-1">Target Status</label>
            <select
              value={overrideStatus}
              onChange={(e) => setOverrideStatus(e.target.value as OrderStatus)}
              className="w-full p-2.5 bg-[#f7f9fb] border border-[#c5c6cd]/80 rounded-lg text-xs"
            >
              <option value="CREATED">CREATED</option>
              <option value="ASSIGNED">ASSIGNED</option>
              <option value="PICKED_UP">PICKED_UP</option>
              <option value="IN_TRANSIT">IN_TRANSIT</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="FAILED">FAILED</option>
              <option value="RESCHEDULED">RESCHEDULED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#191c1e] mb-1">Override Reason / Audit Remarks</label>
            <textarea
              value={overrideRemarks}
              onChange={(e) => setOverrideRemarks(e.target.value)}
              placeholder="e.g. Customer verified address via phone, manual dispatch authorization."
              className="w-full p-2.5 bg-[#f7f9fb] border border-[#c5c6cd]/80 rounded-lg text-xs"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowOverrideModal(false)}
              className="px-4 py-2 border border-[#c5c6cd] text-xs font-semibold rounded-lg hover:bg-[#f2f4f6]"
            >
              Cancel
            </button>
            <button
              onClick={handleOverrideStatus}
              className="px-4 py-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-semibold rounded-lg"
            >
              Apply Override
            </button>
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default AdminOrderDetailPage;
