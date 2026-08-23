import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Mail, MessageSquare, ExternalLink } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import type { Notification } from '../../types';
import Badge from '../../components/ui/Badge';
import Card, { CardHeader } from '../../components/ui/Card';
import { PageSpinner } from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDateTime, formatRelativeTime } from '../../utils/formatters';
import { notificationStatusColors } from '../../utils/statusColors';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchNotifications = useCallback(() => {
    setLoading(true);
    notificationService
      .getMyNotifications({ page, limit: 20 })
      .then((res) => {
        setNotifications(res.data);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-500 text-sm mt-1">{total} total notifications</p>
      </div>

      <Card padding="none">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">All Notifications</h2>
          </div>
        </div>
        {notifications.length === 0 ? (
          <EmptyState
            title="No notifications"
            description="You'll receive notifications here when your order status changes."
            icon="folder"
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <div key={n.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${
                      n.channel === 'EMAIL'
                        ? 'bg-blue-100'
                        : 'bg-green-100'
                    }`}
                  >
                    {n.channel === 'EMAIL' ? (
                      <Mail className="w-4 h-4 text-blue-600" />
                    ) : (
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-semibold text-gray-500 uppercase">
                        {n.event.replace(/_/g, ' ')}
                      </span>
                      <Badge
                        variant={
                          n.status === 'SENT'
                            ? 'green'
                            : n.status === 'FAILED'
                            ? 'red'
                            : 'yellow'
                        }
                        size="sm"
                      >
                        {n.status}
                      </Badge>
                      <Badge
                        variant={n.channel === 'EMAIL' ? 'blue' : 'green'}
                        size="sm"
                      >
                        {n.channel}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700">{n.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                      {n.orderId && (
                        <Link
                          to={`/customer/orders/${n.orderId}`}
                          className="flex items-center gap-1 text-xs text-primary-600 hover:underline"
                        >
                          View Order <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
