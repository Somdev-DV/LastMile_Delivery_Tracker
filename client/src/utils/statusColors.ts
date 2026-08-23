import type { OrderStatus, AgentAvailability } from '../types';

export const orderStatusColors: Record<
  OrderStatus,
  { bg: string; text: string; border: string; dot: string }
> = {
  CREATED: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    dot: 'bg-gray-400',
  },
  ASSIGNED: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  PICKED_UP: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
    dot: 'bg-indigo-500',
  },
  IN_TRANSIT: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  OUT_FOR_DELIVERY: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  DELIVERED: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
  },
  FAILED: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
  },
  RESCHEDULED: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
    dot: 'bg-yellow-500',
  },
  CANCELLED: {
    bg: 'bg-gray-200',
    text: 'text-gray-600',
    border: 'border-gray-300',
    dot: 'bg-gray-500',
  },
};

export const agentAvailabilityColors: Record<
  AgentAvailability,
  { bg: string; text: string; dot: string }
> = {
  AVAILABLE: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  BUSY: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    dot: 'bg-orange-500',
  },
  OFFLINE: {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    dot: 'bg-gray-400',
  },
};

export const notificationStatusColors: Record<
  string,
  { bg: string; text: string }
> = {
  SENT: { bg: 'bg-green-100', text: 'text-green-700' },
  FAILED: { bg: 'bg-red-100', text: 'text-red-700' },
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

export const getStatusColor = (status: OrderStatus): string => {
  const s = orderStatusColors[status];
  return s ? `${s.bg} ${s.text} ${s.border}` : 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getAvailabilityColor = (availability: AgentAvailability): string => {
  const a = agentAvailabilityColors[availability];
  return a ? `${a.bg} ${a.text}` : 'bg-gray-100 text-gray-700';
};

export const getAgentAvailabilityColor = getAvailabilityColor;

export const getOrderStatusDotColor = (status: OrderStatus): string => {
  return orderStatusColors[status]?.dot || 'bg-gray-400';
};

export const getAgentAvailabilityDotColor = (availability: AgentAvailability): string => {
  return agentAvailabilityColors[availability]?.dot || 'bg-gray-400';
};

export const getTimelineStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    CREATED: 'border-gray-400 bg-gray-400',
    ASSIGNED: 'border-blue-500 bg-blue-500',
    PICKED_UP: 'border-indigo-500 bg-indigo-500',
    IN_TRANSIT: 'border-purple-500 bg-purple-500',
    OUT_FOR_DELIVERY: 'border-orange-500 bg-orange-500',
    DELIVERED: 'border-green-500 bg-green-500',
    FAILED: 'border-red-500 bg-red-500',
    RESCHEDULED: 'border-yellow-500 bg-yellow-500',
    CANCELLED: 'border-gray-500 bg-gray-500',
  };
  return colors[status] || 'border-gray-400 bg-gray-400';
};
