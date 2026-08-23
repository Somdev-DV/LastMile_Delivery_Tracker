import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Phone,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import { PageSpinner } from '../../components/ui/Spinner';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import { formatDateTime, formatCurrency, formatWeight } from '../../utils/formatters';

export const TrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!order)
    return (
      <div className="text-center py-16 font-sans">
        <p className="text-gray-500 text-sm">Order not found</p>
        <button
          className="mt-4 px-4 py-2 bg-[#2d403b] text-white text-xs font-semibold rounded-lg"
          onClick={() => navigate(-1)}
        >
          Go back
        </button>
      </div>
    );

  const isDelivered = order.status === 'DELIVERED';
  const isCancelled = ['CANCELLED', 'FAILED'].includes(order.status);
  const isInTransit = ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(order.status);

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      {/* Back button & Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 pb-2 border-b border-gray-200">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to orders
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Tracking #{order.orderNumber}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Order Date: {formatDateTime(order.createdAt)} • Last Updated: {formatDateTime(order.updatedAt)}
          </p>
        </div>

        <div>
          <span
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${
              isDelivered
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : isCancelled
                ? 'bg-red-50 text-red-800 border-red-200'
                : isInTransit
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {isInTransit && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            )}
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Real-time Timeline Audit Trail from DB (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Pickup & Destination Journey Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">
              Route Path
            </h2>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gray-400 before:to-blue-600">
              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-gray-700 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-700"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-700 block">
                  Pickup Origin
                </span>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.pickupAddress}</p>
                <p className="text-[11px] text-gray-500">
                  {order.pickupCity && `${order.pickupCity}, `}{order.pickupPincode} • Zone: {order.pickupZone?.name || 'Unassigned'}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-[27px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                  Drop Destination
                </span>
                <p className="text-xs font-semibold text-gray-900 mt-0.5">{order.dropAddress}</p>
                <p className="text-[11px] text-gray-500">
                  {order.dropCity && `${order.dropCity}, `}{order.dropPincode} • Zone: {order.dropZone?.name || 'Unassigned'}
                </p>
              </div>
            </div>
          </div>

          {/* Real Tracking Events Timeline from Database */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-5">
              Live Tracking History
            </h2>
            <TrackingTimeline
              events={order.trackingEvents || []}
              currentStatus={order.status}
            />
          </div>
        </div>

        {/* Right Column: Order & Driver Info from Database (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Assigned Agent Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Assigned Delivery Agent
            </h3>
            {order.assignedAgent ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700">
                    {order.assignedAgent.user?.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {order.assignedAgent.user?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vehicle: {order.assignedAgent.vehicleType || 'Two Wheeler'}
                    </p>
                  </div>
                </div>
                {order.assignedAgent.user?.phone && (
                  <a
                    href={`tel:${order.assignedAgent.user.phone}`}
                    className="w-full bg-[#2d403b] hover:bg-[#22312d] text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Driver ({order.assignedAgent.user.phone})
                  </a>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-gray-400">
                Agent assignment in progress.
              </div>
            )}
          </div>

          {/* Package Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Package Specs
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Actual Weight</span>
                <span className="font-semibold text-gray-900">
                  {formatWeight(order.actualWeight)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Billable Weight</span>
                <span className="font-semibold text-gray-900">
                  {formatWeight(order.billableWeight)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Dimensions</span>
                <span className="font-semibold text-gray-900">
                  {order.length} × {order.breadth} × {order.height} cm
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-500">Service Category</span>
                <span className="font-semibold text-gray-900">{order.orderType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Payment Mode</span>
                <span className="font-semibold text-gray-900">{order.paymentType}</span>
              </div>
              {order.codAmount && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-amber-900">COD Amount</span>
                  <span className="text-xs font-bold text-amber-900">
                    {formatCurrency(order.codAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPage;
