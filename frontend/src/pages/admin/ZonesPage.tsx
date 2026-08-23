import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { zoneService } from '../../services/zoneService';
import { Zone } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { Map, Plus } from 'lucide-react';

export const ZonesPage: React.FC = () => {
  const { showToast } = useToast();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Zone Modal
  const [showModal, setShowModal] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneDesc, setZoneDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const list = await zoneService.getZones();
      setZones(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[Zones Fetch Error]', err);
      showToast('error', 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;

    try {
      setSaving(true);
      await zoneService.createZone({ name: zoneName.trim(), description: zoneDesc.trim() });
      showToast('success', `Delivery Zone ${zoneName} created successfully.`);
      setShowModal(false);
      setZoneName('');
      setZoneDesc('');
      fetchZones();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to create zone');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Zone Name',
      render: (zone: Zone) => <span className="font-bold text-gray-900">{zone.name}</span>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (zone: Zone) => <span className="text-xs text-gray-600">{zone.description || 'N/A'}</span>,
    },
    {
      key: 'areas',
      header: 'Mapped Areas',
      render: (zone: Zone) => (
        <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
          {zone.areas?.length || 0} Areas
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (zone: Zone) => (
        <Link to={`/admin/zones/areas?zoneId=${zone.id}`}>
          <Button size="sm" variant="outline">
            Manage Areas
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-blue-600" /> Delivery Zones
          </h1>
          <p className="text-sm text-gray-500">Configure logistics regions and operational delivery boundaries</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Delivery Zone
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={zones} keyExtractor={(z) => z.id} />
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create New Delivery Zone">
        <form onSubmit={handleCreateZone} className="space-y-4">
          <Input
            label="Zone Name"
            placeholder="e.g. South Bangalore Zone"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            required
          />
          <Input
            label="Description (Optional)"
            placeholder="e.g. Electronic City, BTM, Bannerghatta Corridor"
            value={zoneDesc}
            onChange={(e) => setZoneDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Create Zone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ZonesPage;
