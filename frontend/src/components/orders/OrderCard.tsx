import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import OrderStatusBadge from './OrderStatusBadge';
import { MapPin, Package, ArrowRight } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  linkBase?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, linkBase = '/customer/orders' }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`${linkBase}/${order.id}`)}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all cursor-pointer p-4"
    >
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {formatDateTime(order.createdAt)}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="truncate">{order.pickupCity || order.pickupPincode}</span>
        <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
        <span className="truncate">{order.dropCity || order.dropPincode}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Package className="w-3.5 h-3.5" />
          <span>{order.orderType}</span>
          <span className="text-gray-300">•</span>
          <span>{order.paymentType}</span>
        </div>
        {order.calculatedCharge !== undefined && (
          <span className="font-bold text-primary-600 text-sm">
            {formatCurrency(order.calculatedCharge)}
          </span>
        )}
      </div>
    </div>
  );
};

export default OrderCard;
