import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Package,
  ChevronRight,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import { agentService } from '../../services/agentService';
import type { Order, OrderStatus } from '../../types';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import Modal from '../../components/ui/Modal';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { formatDateTime, formatWeight, formatCurrency } from '../../utils/formatters';

const nextStatuses: Record<string, OrderStatus[]> = {
  ASSIGNED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
};

export const DeliveryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null);
  const [remarks, setRemarks] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || !id) return;
    if (selectedStatus === 'FAILED' && !failureReason.trim()) {
      toast.error('Please enter a failure reason');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await agentService.updateDeliveryStatus(
        id,
        selectedStatus,
        remarks,
        failureReason
      );
      setOrder(updated);
      setModalOpen(false);
      setRemarks('');
      setFailureReason('');
      toast.success(`Status updated to ${selectedStatus}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!order)
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-sm">Delivery order not found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#2d403b] text-white text-xs font-semibold rounded-lg"
        >
          Go back
        </button>
      </div>
    );

  const availableNext = nextStatuses[order.status] ?? [];
  const isDelivered = order.status === 'DELIVERED';
  const isFailed = order.status === 'FAILED';
  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.status);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Package #{order.orderNumber}
              </h1>
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
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Created on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Status Update Action Bar */}
      {availableNext.length > 0 && (
        <div className="bg-[#2d403b] text-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Action Required: Advance Route Status
            </h3>
            <p className="text-xs text-white/80 mt-0.5">
              Update package lifecycle stage as you proceed along the delivery journey.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableNext.map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setModalOpen(true);
                }}
                className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 active:scale-98 ${
                  status === 'FAILED'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }`}
              >
                Mark as {status.replace(/_/g, ' ')}
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Route & Package */}
        <div className="lg:col-span-7 space-y-6">
          {/* Route Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Pickup & Drop Journey
            </h3>
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gray-400 before:to-blue-600">
              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-700 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  Pickup Location
                </span>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.pickupAddress}</p>
                <p className="text-[11px] text-gray-500">
                  {order.pickupCity && `${order.pickupCity}, `}{order.pickupPincode}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Delivery Destination
                </span>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.dropAddress}</p>
                <p className="text-[11px] text-gray-500">
                  {order.dropCity && `${order.dropCity}, `}{order.dropPincode}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Immutable Tracking Timeline
            </h3>
            <TrackingTimeline
              events={order.trackingEvents ?? []}
              currentStatus={order.status}
            />
          </div>
        </div>

        {/* Right Column (5 cols): Customer & Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Customer Info Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Customer Contact
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">
                {order.customer?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{order.customer?.name}</p>
                <p className="text-[11px] text-gray-500">{order.customer?.email}</p>
              </div>
            </div>

            {order.customer?.phone && (
              <a
                href={`tel:${order.customer.phone}`}
                className="w-full bg-[#2d403b] hover:bg-[#22312d] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                Call Recipient ({order.customer.phone})
              </a>
            )}
          </div>

          {/* Parcel Specifications */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Package Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Billable Weight</span>
                <span className="font-semibold text-gray-900">{formatWeight(order.billableWeight)}</span>
              </div>
              <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <span className="text-[10px] text-gray-500 block">Payment Type</span>
                <span className="font-semibold text-gray-900">{order.paymentType}</span>
              </div>
            </div>
            {order.codAmount && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex justify-between items-center">
                <span className="text-xs font-bold text-amber-900">Collect COD Amount:</span>
                <span className="text-sm font-bold text-amber-900">
                  {formatCurrency(order.codAmount)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Advance to ${selectedStatus?.replace(/_/g, ' ')}`}
      >
        <div className="space-y-4 font-sans text-xs">
          {selectedStatus === 'FAILED' && (
            <div>
              <label className="block text-xs font-semibold text-red-600 mb-1">
                Failure Reason *
              </label>
              <textarea
                rows={3}
                placeholder="Recipient unavailable, wrong address, customer refused..."
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-red-300 rounded-lg text-xs focus:outline-none focus:border-red-500"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-1">
              Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Handed over to recipient, signature obtained, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-gray-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 text-xs font-semibold rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStatusUpdate}
              disabled={submitting}
              className={`px-4 py-2 text-xs font-semibold rounded-lg text-white ${
                selectedStatus === 'FAILED' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#2d403b] hover:bg-[#22312d]'
              }`}
            >
              {submitting ? 'Updating...' : 'Confirm Status Update'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeliveryDetailPage;
