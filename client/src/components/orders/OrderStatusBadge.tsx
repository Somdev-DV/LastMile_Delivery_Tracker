import React from 'react';
import type { OrderStatus } from '../../types';
import Badge from '../ui/Badge';
import { formatOrderStatus } from '../../utils/formatters';

const statusVariant: Record<OrderStatus, 'gray' | 'blue' | 'indigo' | 'purple' | 'orange' | 'green' | 'red' | 'yellow' | 'darkgray'> = {
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

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
  size = 'md',
}) => (
  <Badge variant={statusVariant[status]} dot size={size}>
    {formatOrderStatus(status)}
  </Badge>
);

export default OrderStatusBadge;
