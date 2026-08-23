import React from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import type { Zone } from '../../types';
import { Search, X } from 'lucide-react';

interface OrderFiltersProps {
  search: string;
  status: string;
  zones: Zone[];
  zoneId: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onZoneChange: (v: string) => void;
  onReset: () => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'CREATED', label: 'Created' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'PICKED_UP', label: 'Picked Up' },
  { value: 'IN_TRANSIT', label: 'In Transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'RESCHEDULED', label: 'Rescheduled' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const OrderFilters: React.FC<OrderFiltersProps> = ({
  search,
  status,
  zones,
  zoneId,
  onSearchChange,
  onStatusChange,
  onZoneChange,
  onReset,
}) => {
  const zoneOptions = [
    { value: '', label: 'All Zones' },
    ...zones.map((z) => ({ value: z.id, label: z.name })),
  ];

  const hasFilters = search || status || zoneId;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search orders..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          leftAddon={<Search className="w-4 h-4" />}
        />
      </div>
      <div className="min-w-[160px]">
        <Select
          options={statusOptions}
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
        />
      </div>
      <div className="min-w-[160px]">
        <Select
          options={zoneOptions}
          value={zoneId}
          onChange={(e) => onZoneChange(e.target.value)}
        />
      </div>
      {hasFilters && (
        <Button variant="ghost" size="sm" leftIcon={<X className="w-4 h-4" />} onClick={onReset}>
          Clear
        </Button>
      )}
    </div>
  );
};

export default OrderFilters;
