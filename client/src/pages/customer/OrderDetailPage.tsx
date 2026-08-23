import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCcw,
  Activity,
  Phone,
} from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import PriceBreakdown from '../../components/orders/PriceBreakdown';
import TrackingTimeline from '../../components/tracking/TrackingTimeline';
import { PageSpinner } from '../../components/ui/Spinner';
import { formatDateTime, formatCurrency, formatWeight } from '../../utils/formatters';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (error || !order)
    return (
      <div className="text-center py-12 font-sans">
        <p className="text-red-600 text-sm">{error || 'Order not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#2d403b] text-white text-xs font-semibold rounded-lg"
        >
          Go back
        </button>
      </div>
    );

  const rateBreakdown = order.calculatedCharge !== undefined
    ? {
        actualWeight: order.actualWeight,
        volumetricWeight: order.volumetricWeight,
        billableWeight: order.billableWeight,
        pickupZone: order.pickupZone?.name ?? order.pickupPincode,
        dropZone: order.dropZone?.name ?? order.dropPincode,
        routeType: order.pickupZoneId === order.dropZoneId ? ('INTRA_ZONE' as const) : ('INTER_ZONE' as const),
        orderType: order.orderType,
        paymentType: order.paymentType,
        baseRate: order.baseRate ?? 0,
        weightCharge: order.weightCharge ?? 0,
        codSurcharge: order.codSurcharge ?? 0,
        totalCharge: order.calculatedCharge ?? 0,
        rateCardId: '',
      }
    : null;

  const isDelivered = order.status === 'DELIVERED';
  const isFailed = ['FAILED', 'RETURNED'].includes(order.status);
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
                Order #{order.orderNumber}
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
              Booked on {formatDateTime(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {order.status === 'FAILED' && (
            <button
              onClick={() => navigate(`/customer/orders/${id}/reschedule`)}
              className="px-4 py-2 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reschedule
            </button>
          )}
          <Link
            to={`/customer/orders/${id}/track`}
            className="px-4 py-2 bg-[#2d403b] hover:bg-[#22312d] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Activity className="w-3.5 h-3.5" /> Live Tracking
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Route Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Delivery Route
            </h3>
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
                  {order.pickupCity && `${order.pickupCity}, `}{order.pickupPincode}
                  {order.pickupZone && ` • Zone: ${order.pickupZone.name}`}
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
                  {order.dropCity && `${order.dropCity}, `}{order.dropPincode}
                  {order.dropZone && ` • Zone: ${order.dropZone.name}`}
                </p>
              </div>
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Package & Billing Details
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {[
                { label: 'Dimensions', value: `${order.length}×${order.breadth}×${order.height} cm` },
                { label: 'Actual Weight', value: formatWeight(order.actualWeight) },
                { label: 'Volumetric', value: formatWeight(order.volumetricWeight) },
                { label: 'Billable Weight', value: formatWeight(order.billableWeight) },
              ].map((item) => (
                <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <span className="text-[10px] text-gray-500 block">{item.label}</span>
                  <span className="font-semibold text-xs text-gray-900 mt-0.5 block">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              <div>
                <span className="text-[10px] text-gray-500 block">Order Type</span>
                <span className="text-xs font-semibold text-gray-900">{order.orderType}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Payment Method</span>
                <span className="text-xs font-semibold text-gray-900">{order.paymentType}</span>
              </div>
              {order.codAmount && (
                <div>
                  <span className="text-[10px] text-gray-500 block">COD Amount</span>
                  <span className="text-xs font-semibold text-gray-900">{formatCurrency(order.codAmount)}</span>
                </div>
              )}
            </div>

            {order.remarks && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <span className="text-[10px] font-bold text-amber-900 block">Special Instructions</span>
                <p className="text-xs text-amber-900 mt-0.5">{order.remarks}</p>
              </div>
            )}
          </div>

          {/* Tracking History */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
              Tracking Events
            </h3>
            <TrackingTimeline
              events={order.trackingEvents ?? []}
              currentStatus={order.status}
            />
          </div>
        </div>

        {/* Right column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Price Breakdown Component */}
          {rateBreakdown && <PriceBreakdown breakdown={rateBreakdown} />}

          {/* Assigned Driver Card */}
          {order.assignedAgent && (
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                Assigned Delivery Agent
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700">
                  {order.assignedAgent.user?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900">
                    {order.assignedAgent.user?.name}
                  </p>
                  <p className="text-[11px] text-gray-500">
                    Vehicle: {order.assignedAgent.vehicleType || 'Two Wheeler'}
                  </p>
                </div>
              </div>
              {order.assignedAgent?.user?.phone && (
                <a
                  href={`tel:${order.assignedAgent.user.phone}`}
                  className="mt-4 w-full bg-[#2d403b] hover:bg-[#22312d] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call Driver ({order.assignedAgent.user.phone})
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
