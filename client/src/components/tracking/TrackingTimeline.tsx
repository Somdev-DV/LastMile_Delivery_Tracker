import React from 'react';
import type { TrackingEvent, OrderStatus } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { orderStatusColors } from '../../utils/statusColors';
import Badge from '../ui/Badge';
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

const statusIcon: Record<OrderStatus, React.ReactNode> = {
  CREATED: <Package className="w-4 h-4" />,
  ASSIGNED: <Truck className="w-4 h-4" />,
  PICKED_UP: <Package className="w-4 h-4" />,
  IN_TRANSIT: <Truck className="w-4 h-4" />,
  OUT_FOR_DELIVERY: <MapPin className="w-4 h-4" />,
  DELIVERED: <CheckCircle2 className="w-4 h-4" />,
  FAILED: <XCircle className="w-4 h-4" />,
  RESCHEDULED: <RotateCcw className="w-4 h-4" />,
  CANCELLED: <AlertCircle className="w-4 h-4" />,
};

const statusIconBg: Record<OrderStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-500',
  ASSIGNED: 'bg-blue-100 text-blue-600',
  PICKED_UP: 'bg-indigo-100 text-indigo-600',
  IN_TRANSIT: 'bg-purple-100 text-purple-600',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-600',
  DELIVERED: 'bg-green-100 text-green-600',
  FAILED: 'bg-red-100 text-red-600',
  RESCHEDULED: 'bg-yellow-100 text-yellow-600',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

const badgeVariant: Record<OrderStatus, 'gray' | 'blue' | 'indigo' | 'purple' | 'orange' | 'green' | 'red' | 'yellow' | 'darkgray'> = {
  CREATED: 'gray',
  ASSIGNED: 'blue',
  PICKED_UP: 'indigo',
  IN_TRANSIT: 'purple',
  OUT_FOR_DELIVERY: 'orange',
  DELIVERED: 'green',
  FAILED: 'red',
  RESCHEDULED: 'yellow',
  CANCELLED: 'darkgray',
};

interface TrackingTimelineProps {
  events: TrackingEvent[];
  currentStatus: OrderStatus;
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  events,
  currentStatus,
}) => {
  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div>
      {/* Current status hero */}
      <div
        className={`rounded-xl p-4 mb-6 flex items-center gap-3 ${orderStatusColors[currentStatus].bg} border ${orderStatusColors[currentStatus].border}`}
      >
        <div className={`p-2 rounded-full ${statusIconBg[currentStatus]}`}>
          {statusIcon[currentStatus]}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Current Status
          </p>
          <p
            className={`text-base font-bold ${orderStatusColors[currentStatus].text}`}
          >
            {currentStatus.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {/* Timeline */}
      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No tracking events yet
        </p>
      ) : (
        <ol className="relative border-l-2 border-gray-200 ml-4 space-y-0">
          {sorted.map((event, idx) => (
            <li key={event.id} className="ml-6 pb-6 last:pb-0">
              <span
                className={`absolute -left-3.5 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-white ${statusIconBg[event.newStatus]}`}
              >
                {statusIcon[event.newStatus]}
              </span>
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <Badge variant={badgeVariant[event.newStatus]} dot>
                    {event.newStatus.replace(/_/g, ' ')}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(event.timestamp)}
                  </div>
                </div>
                {event.prevStatus && (
                  <p className="text-xs text-gray-400 mt-1">
                    From: {event.prevStatus.replace(/_/g, ' ')}
                  </p>
                )}
                {event.remarks && (
                  <p className="text-sm text-gray-600 mt-2">{event.remarks}</p>
                )}
                <div className="mt-2 text-xs text-gray-400">
                  Updated by {event.actor?.name ?? 'System'} (
                  {event.actorRole.replace(/_/g, ' ')})
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default TrackingTimeline;
