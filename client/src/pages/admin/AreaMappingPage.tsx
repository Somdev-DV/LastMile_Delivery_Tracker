import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { zoneService } from '../../services/zoneService';
import { Zone, Area } from '../../types';
import Card, { CardHeader } from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { MapPin, Plus, Trash2, Search } from 'lucide-react';

export const AreaMappingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { showToast } = useToast();

  const [zones, setZones] = useState<Zone[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState(searchParams.get('zoneId') || '');
  const [loading, setLoading] = useState(true);

  // Add Area Modal
  const [showModal, setShowModal] = useState(false);
  const [areaName, setAreaName] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('Bangalore');
  const [saving, setSaving] = useState(false);

  // Zone Detector Tester
  const [testPin, setTestPin] = useState('');
  const [detectedResult, setDetectedResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const list = await zoneService.getZones();
      const safeList = Array.isArray(list) ? list : [];
      setZones(safeList);
      if (!selectedZoneId && safeList.length > 0) {
        setSelectedZoneId(safeList[0].id);
      }
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

  const currentZone = zones.find((z) => z.id === selectedZoneId);

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedZoneId || !areaName || !pincode) return;

    try {
      setSaving(true);
      await zoneService.addArea(selectedZoneId, { name: areaName, pincode, city });
      showToast('success', `Area ${areaName} mapped to zone.`);
      setShowModal(false);
      setAreaName('');
      setPincode('');
      fetchZones();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to add area mapping');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveArea = async (areaId: string) => {
    try {
      await zoneService.removeArea(areaId);
      showToast('success', 'Area mapping removed');
      fetchZones();
    } catch (err) {
      showToast('error', 'Failed to remove area');
    }
  };

  const handleTestPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPin) return;

    try {
      setTesting(true);
      const zone = await zoneService.detectZone(testPin);
      if (zone?.name) {
        setDetectedResult(`✅ Pincode ${testPin} maps to: ${zone.name}`);
      } else {
        setDetectedResult(`❌ Pincode ${testPin} is not mapped to any zone`);
      }
    } catch (err: any) {
      setDetectedResult(`❌ ${err.response?.data?.message || 'Pincode not mapped to any zone'}`);
    } finally {
      setTesting(false);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Area / Locality Name',
      render: (area: Area) => <span className="font-semibold text-gray-900">{area.name}</span>,
    },
    {
      key: 'pincode',
      header: 'Postal Pincode',
      render: (area: Area) => (
        <span className="font-mono text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-800 font-bold">
          {area.pincode}
        </span>
      ),
    },
    {
      key: 'city',
      header: 'City',
      render: (area: Area) => <span className="text-xs text-gray-600">{area.city || 'Bangalore'}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (area: Area) => (
        <Button size="sm" variant="danger" onClick={() => handleRemoveArea(area.id)}>
          <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" /> Area & Pincode Mappings
          </h1>
          <p className="text-sm text-gray-500">Associate postal codes with operational delivery zones</p>
        </div>
        <Button onClick={() => setShowModal(true)} disabled={!selectedZoneId}>
          <Plus className="w-4 h-4 mr-1.5" /> Map New Area
        </Button>
      </div>

      {/* Pincode Detection Live Tester Widget */}
      <Card className="bg-blue-50/50 border-blue-200">
        <form onSubmit={handleTestPincode} className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1">
            <span className="text-xs font-bold text-blue-900 uppercase">Test Pincode Zone Detection</span>
            <input
              type="text"
              value={testPin}
              onChange={(e) => setTestPin(e.target.value)}
              placeholder="Enter 6-digit Pincode (e.g. 560034, 560066)"
              className="mt-1 w-full px-3 py-1.5 border rounded-md text-sm bg-white"
            />
          </div>
          <Button type="submit" size="sm" className="mt-4 sm:mt-5" isLoading={testing}>
            <Search className="w-3.5 h-3.5 mr-1" /> Test Detection
          </Button>
        </form>
        {detectedResult && (
          <p className="mt-3 text-xs font-semibold p-2 bg-white rounded border border-blue-100">{detectedResult}</p>
        )}
      </Card>

      {/* Zone Selector */}
      <div className="flex gap-2 border-b border-gray-200 pb-2 overflow-x-auto">
        {zones.map((zone) => (
          <button
            key={zone.id}
            onClick={() => setSelectedZoneId(zone.id)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors shrink-0 ${
              selectedZoneId === zone.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {zone.name} ({zone.areas?.length || 0})
          </button>
        ))}
      </div>

      {/* Areas Table */}
      <Card>
        <CardHeader title={currentZone ? `Mapped Areas in ${currentZone.name}` : 'Select a Zone'} />
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={currentZone?.areas || []} keyExtractor={(a) => a.id} />
        )}
      </Card>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Map Area to Zone">
        <form onSubmit={handleAddArea} className="space-y-4">
          <Input
            label="Area / Locality Name"
            placeholder="e.g. Koramangala 4th Block"
            value={areaName}
            onChange={(e) => setAreaName(e.target.value)}
            required
          />
          <Input
            label="Postal Pincode"
            placeholder="e.g. 560034"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            required
          />
          <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              Save Mapping
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AreaMappingPage;
