import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card, { CardHeader } from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ui/Toast';
import { formatDateTime } from '../../utils/formatters';

const ReschedulePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, removeToast, toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!id) return;
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !scheduledDate) return;
    setSubmitting(true);
    try {
      await orderService.rescheduleOrder(id, scheduledDate, reason);
      toast.success('Delivery rescheduled successfully');
      setTimeout(() => navigate(`/customer/orders/${id}`), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Failed to reschedule');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!order)
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
      </div>
    );

  const lastAttempt = order.attempts?.[order.attempts.length - 1];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Reschedule Delivery
          </h1>
          <p className="text-sm text-gray-500">Order #{order.orderNumber}</p>
        </div>
      </div>

      {/* Failure reason */}
      {lastAttempt?.failureReason && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-red-600 uppercase mb-1">
            Failure Reason
          </p>
          <p className="text-sm text-red-700">{lastAttempt.failureReason}</p>
          <p className="text-xs text-red-400 mt-1">
            Attempt {lastAttempt.attemptNumber} •{' '}
            {formatDateTime(lastAttempt.startedAt)}
          </p>
        </div>
      )}

      <Card>
        <CardHeader
          title="Schedule New Delivery"
          subtitle="Choose a convenient date for redelivery"
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Delivery Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              min={minDate}
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes (optional)
            </label>
            <textarea
              rows={3}
              placeholder="Any special instructions for the rescheduled delivery..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={submitting}
              leftIcon={<CalendarDays className="w-4 h-4" />}
            >
              Reschedule
            </Button>
          </div>
        </form>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ReschedulePage;
