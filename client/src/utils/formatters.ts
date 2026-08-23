import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr: string): string => {
  try {
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
};

export const formatRelativeTime = (dateStr: string): string => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatWeight = (kg: number): string => {
  return `${kg.toFixed(2)} kg`;
};

export const formatOrderStatus = (status: string): string => {
  return status
    .split('_')
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(' ');
};

export const formatRole = (role: string): string => {
  switch (role) {
    case 'DELIVERY_AGENT':
      return 'Delivery Agent';
    case 'CUSTOMER':
      return 'Customer';
    case 'ADMIN':
      return 'Admin';
    default:
      return role;
  }
};
