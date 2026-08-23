import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { Notification } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AdminNotificationsPage: React.FC = () => {
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const list = await adminService.getNotifications();
      setNotifications(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[Notifications Fetch Error]', err);
      showToast('error', 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const columns = [
    {
      key: 'event',
      header: 'Channel & Event',
      render: (n: Notification) => (
        <div className="flex items-center space-x-2">
          {n.channel === 'EMAIL' ? (
            <Mail className="w-4 h-4 text-blue-500" />
          ) : (
            <MessageSquare className="w-4 h-4 text-green-500" />
          )}
          <div>
            <p className="font-semibold text-gray-900 text-xs">{n.event}</p>
            <span className="text-xs text-gray-500">{n.channel}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'message',
      header: 'Message Body',
      render: (n: Notification) => <p className="text-xs text-gray-700 max-w-md">{n.message}</p>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (n: Notification) => (
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
            n.status === 'SENT'
              ? 'bg-green-100 text-green-800'
              : n.status === 'FAILED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {n.status}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Timestamp',
      render: (n: Notification) => <span className="text-xs text-gray-500">{formatDateTime(n.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" /> System Notification Logs
        </h1>
        <p className="text-sm text-gray-500">Audit trail of automated SMS and Email alerts dispatched across deliveries</p>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={notifications} keyExtractor={(n) => n.id} />
        )}
      </Card>
    </div>
  );
};

export default AdminNotificationsPage;
