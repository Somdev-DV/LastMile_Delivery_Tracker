import React, { useEffect, useState } from 'react';
import { agentService } from '../../services/agentService';
import { DeliveryAgent, AgentAvailability } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { getAvailabilityColor } from '../../utils/statusColors';
import { Truck, MapPin } from 'lucide-react';

export const AgentsPage: React.FC = () => {
  const { showToast } = useToast();
  const [agents, setAgents] = useState<DeliveryAgent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const list = await agentService.getAgents();
      setAgents(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error('[Agents Fetch Error]', err);
      showToast('error', 'Failed to load agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleToggleAvailability = async (agent: DeliveryAgent, newStatus: AgentAvailability) => {
    try {
      await agentService.updateAvailability(agent.id, newStatus);
      showToast('success', `Agent status updated to ${newStatus}`);
      fetchAgents();
    } catch (err: any) {
      showToast('error', 'Failed to update agent status');
    }
  };

  const columns = [
    {
      key: 'agent',
      header: 'Agent Name & Contact',
      render: (agent: DeliveryAgent) => (
        <div>
          <p className="font-semibold text-gray-900">{agent.user?.name}</p>
          <p className="text-xs text-gray-500">{agent.user?.email}</p>
          <p className="text-xs text-gray-500">{agent.user?.phone || 'No phone'}</p>
        </div>
      ),
    },
    {
      key: 'zone',
      header: 'Assigned Zone',
      render: (agent: DeliveryAgent) => (
        <span className="flex items-center text-xs font-medium text-gray-700">
          <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
          {agent.zone?.name || 'All Zones'}
        </span>
      ),
    },
    {
      key: 'vehicle',
      header: 'Vehicle',
      render: (agent: DeliveryAgent) => (
        <span className="flex items-center text-xs text-gray-600">
          <Truck className="w-3.5 h-3.5 mr-1 text-gray-400" />
          {agent.vehicleType || 'Two Wheeler'}
        </span>
      ),
    },
    {
      key: 'availability',
      header: 'Availability Status',
      render: (agent: DeliveryAgent) => (
        <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${getAvailabilityColor(agent.availability)}`}>
          {agent.availability}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Quick Action',
      render: (agent: DeliveryAgent) => (
        <div className="flex gap-1.5">
          {agent.availability !== 'AVAILABLE' && (
            <Button size="sm" variant="outline" onClick={() => handleToggleAvailability(agent, 'AVAILABLE')}>
              Set Available
            </Button>
          )}
          {agent.availability !== 'BUSY' && (
            <Button size="sm" variant="ghost" onClick={() => handleToggleAvailability(agent, 'BUSY')}>
              Set Busy
            </Button>
          )}
          {agent.availability !== 'OFFLINE' && (
            <Button size="sm" variant="ghost" onClick={() => handleToggleAvailability(agent, 'OFFLINE')}>
              Set Offline
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Fleet & Agents</h1>
          <p className="text-sm text-gray-500">Monitor driver locations, active status, and availability state</p>
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={agents} keyExtractor={(a) => a.id} />
        )}
      </Card>
    </div>
  );
};

export default AgentsPage;
