import React, { useEffect, useState } from 'react';
import { rateService } from '../../services/rateService';
import { RateCard, OrderType, RouteType } from '../../types';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { DollarSign, Plus, Edit2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RateCardsPage: React.FC = () => {
  const { showToast } = useToast();
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('B2C');
  const [routeType, setRouteType] = useState<RouteType>('INTRA_ZONE');
  const [baseRate, setBaseRate] = useState('50');
  const [perKgRate, setPerKgRate] = useState('10');
  const [minWeight, setMinWeight] = useState('1.0');
  const [saving, setSaving] = useState(false);

  const fetchRateCards = async () => {
    try {
      setLoading(true);
      const res = await rateService.getRates();
      const items = Array.isArray(res) ? res : [];
      setRateCards(items);
    } catch (err: any) {
      console.error('[RateCards Error]', err);
      showToast('error', err.response?.data?.message || 'Failed to load rate cards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRateCards();
  }, []);

  const openCreateModal = () => {
    setEditingCard(null);
    setOrderType('B2C');
    setRouteType('INTRA_ZONE');
    setBaseRate('50');
    setPerKgRate('10');
    setMinWeight('1.0');
    setShowModal(true);
  };

  const openEditModal = (card: RateCard) => {
    setEditingCard(card);
    setOrderType(card.orderType);
    setRouteType(card.routeType);
    setBaseRate(card.baseRate.toString());
    setPerKgRate(card.perKgRate.toString());
    setMinWeight(card.minWeight.toString());
    setShowModal(true);
  };

  const handleSaveRateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        orderType,
        routeType,
        baseRate: parseFloat(baseRate),
        perKgRate: parseFloat(perKgRate),
        minWeight: parseFloat(minWeight),
        isActive: true,
      };

      if (editingCard) {
        await rateService.updateRateCard(editingCard.id, payload);
        showToast('success', 'Rate card updated successfully');
      } else {
        await rateService.createRateCard(payload);
        showToast('success', 'New rate card configured');
      }
      setShowModal(false);
      fetchRateCards();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to save rate card');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      key: 'orderType',
      header: 'Order Classification',
      render: (c: RateCard) => (
        <span className={`px-2.5 py-1 font-bold text-xs rounded-full ${c.orderType === 'B2B' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
          {c.orderType}
        </span>
      ),
    },
    {
      key: 'routeType',
      header: 'Route Type',
      render: (c: RateCard) => (
        <span className="font-semibold text-xs text-gray-800">
          {c.routeType.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'baseRate',
      header: 'Base Rate',
      render: (c: RateCard) => <span className="font-bold text-gray-900">{formatCurrency(c.baseRate)}</span>,
    },
    {
      key: 'minWeight',
      header: 'Included Min Weight',
      render: (c: RateCard) => <span className="text-xs text-gray-600">{c.minWeight} kg</span>,
    },
    {
      key: 'perKgRate',
      header: 'Per Kg Additional Rate',
      render: (c: RateCard) => (
        <span className="font-medium text-xs text-green-700">+{formatCurrency(c.perKgRate)} / kg</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (c: RateCard) => (
        <Button size="sm" variant="ghost" onClick={() => openEditModal(c)}>
          <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-green-600" /> Delivery Rate Cards
          </h1>
          <p className="text-sm text-gray-500">Configure separate B2B and B2C intra-zone & inter-zone pricing rules</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-1.5" /> Configure Rate Card
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="py-12 flex justify-center">
            <Spinner />
          </div>
        ) : (
          <Table columns={columns} data={rateCards} keyExtractor={(c) => c.id} />
        )}
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingCard ? 'Edit Rate Card' : 'Create New Rate Card'}
      >
        <form onSubmit={handleSaveRateCard} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Order Classification</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                disabled={!!editingCard}
              >
                <option value="B2C">B2C (Retail)</option>
                <option value="B2B">B2B (Enterprise)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Route Classification</label>
              <select
                value={routeType}
                onChange={(e) => setRouteType(e.target.value as RouteType)}
                className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                disabled={!!editingCard}
              >
                <option value="INTRA_ZONE">Intra-Zone (Same Zone)</option>
                <option value="INTER_ZONE">Inter-Zone (Cross Zone)</option>
              </select>
            </div>
          </div>

          <Input
            label="Base Delivery Charge (₹)"
            type="number"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
            required
          />
          <Input
            label="Included Minimum Weight Threshold (kg)"
            type="number"
            step="0.1"
            value={minWeight}
            onChange={(e) => setMinWeight(e.target.value)}
            required
          />
          <Input
            label="Additional Rate Per Extra Kg (₹/kg)"
            type="number"
            step="0.5"
            value={perKgRate}
            onChange={(e) => setPerKgRate(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={saving}>
              {editingCard ? 'Update Rate Rule' : 'Create Rate Card'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RateCardsPage;
