import React, { useEffect, useState } from 'react';
import { rateService } from '../../services/rateService';
import { CodSurcharge, OrderType } from '../../types';
import Card, { CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { useToast } from '../../hooks/useToast';
import { Banknote, Save } from 'lucide-react';

export const CodConfigPage: React.FC = () => {
  const { showToast } = useToast();
  const [, setConfigs] = useState<CodSurcharge[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states for B2C & B2B
  const [b2cPercent, setB2cPercent] = useState('2.0');
  const [b2cFlat, setB2cFlat] = useState('25');
  const [b2bPercent, setB2bPercent] = useState('1.5');
  const [b2bFlat, setB2bFlat] = useState('50');
  const [saving, setSaving] = useState(false);

  const fetchConfigs = async () => {
    try {
      setLoading(true);
      const list = await rateService.getCodSurcharges();
      const safeList = Array.isArray(list) ? list : [];
      setConfigs(safeList);

      const b2c = safeList.find((c) => c.orderType === 'B2C');
      if (b2c) {
        setB2cPercent(b2c.percentage.toString());
        setB2cFlat(b2c.flatAmount.toString());
      }
      const b2b = safeList.find((c) => c.orderType === 'B2B');
      if (b2b) {
        setB2bPercent(b2b.percentage.toString());
        setB2bFlat(b2b.flatAmount.toString());
      }
    } catch (err: any) {
      console.error('[COD Error]', err);
      showToast('error', err.response?.data?.message || 'Failed to load COD configs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleSave = async (orderType: OrderType) => {
    try {
      setSaving(true);
      const payload = {
        orderType,
        percentage: parseFloat(orderType === 'B2C' ? b2cPercent : b2bPercent),
        flatAmount: parseFloat(orderType === 'B2C' ? b2cFlat : b2bFlat),
      };
      await rateService.updateCodSurcharge(payload);
      showToast('success', `${orderType} COD surcharge rules updated`);
      fetchConfigs();
    } catch (err: any) {
      showToast('error', err.response?.data?.message || 'Failed to update COD config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Banknote className="w-6 h-6 text-emerald-600" /> Cash on Delivery (COD) Surcharge
        </h1>
        <p className="text-sm text-gray-500">Configure separate COD fees and percentage rates for retail and enterprise orders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* B2C COD Configuration */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader title="B2C (Retail) COD Configuration" />
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 text-xs">
              Fee applied to retail customer deliveries: higher of flat charge or percentage of consignment value.
            </p>
            <Input
              label="COD Surcharge Percentage (%)"
              type="number"
              step="0.1"
              value={b2cPercent}
              onChange={(e) => setB2cPercent(e.target.value)}
              helperText="e.g. 2.0% of order value"
            />
            <Input
              label="Minimum Flat Surcharge Amount (₹)"
              type="number"
              step="1"
              value={b2cFlat}
              onChange={(e) => setB2cFlat(e.target.value)}
              helperText="e.g. ₹25 minimum floor fee"
            />
            <div className="pt-2">
              <Button onClick={() => handleSave('B2C')} isLoading={saving} className="w-full">
                <Save className="w-4 h-4 mr-1.5" /> Save B2C Configuration
              </Button>
            </div>
          </div>
        </Card>

        {/* B2B COD Configuration */}
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader title="B2B (Enterprise) COD Configuration" />
          <div className="space-y-4 text-sm">
            <p className="text-gray-600 text-xs">
              Fee applied to commercial bulk invoice shipments on delivery.
            </p>
            <Input
              label="COD Surcharge Percentage (%)"
              type="number"
              step="0.1"
              value={b2bPercent}
              onChange={(e) => setB2bPercent(e.target.value)}
              helperText="e.g. 1.5% of consignment value"
            />
            <Input
              label="Minimum Flat Surcharge Amount (₹)"
              type="number"
              step="1"
              value={b2bFlat}
              onChange={(e) => setB2bFlat(e.target.value)}
              helperText="e.g. ₹50 minimum floor fee"
            />
            <div className="pt-2">
              <Button onClick={() => handleSave('B2B')} isLoading={saving} className="w-full">
                <Save className="w-4 h-4 mr-1.5" /> Save B2B Configuration
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CodConfigPage;
