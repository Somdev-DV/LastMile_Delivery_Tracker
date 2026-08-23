import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { zoneService } from '../../services/zoneService';
import type { Zone, RateBreakdown } from '../../types';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PriceBreakdown from '../../components/orders/PriceBreakdown';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ui/Toast';

const schema = z.object({
  pickupAddress: z.string().min(5, 'Enter full pickup address'),
  pickupPincode: z.string().length(6, 'Pincode must be 6 digits'),
  pickupCity: z.string().optional(),
  dropAddress: z.string().min(5, 'Enter full drop address'),
  dropPincode: z.string().length(6, 'Pincode must be 6 digits'),
  dropCity: z.string().optional(),
  length: z.coerce.number().positive('Must be positive'),
  breadth: z.coerce.number().positive('Must be positive'),
  height: z.coerce.number().positive('Must be positive'),
  actualWeight: z.coerce.number().positive('Must be positive'),
  orderType: z.enum(['B2B', 'B2C']),
  paymentType: z.enum(['PREPAID', 'COD']),
  codAmount: z.coerce.number().optional(),
  remarks: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const steps = [
  'Pickup Details',
  'Drop Details',
  'Package Details',
  'Order Details',
  'Price Preview',
];

const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { toasts, removeToast, toast } = useToast();
  const [step, setStep] = useState(0);
  const [pickupZone, setPickupZone] = useState<Zone | null>(null);
  const [dropZone, setDropZone] = useState<Zone | null>(null);
  const [loadingPickupZone, setLoadingPickupZone] = useState(false);
  const [loadingDropZone, setLoadingDropZone] = useState(false);
  const [pricing, setPricing] = useState<RateBreakdown | null>(null);
  const [pricingError, setPricingError] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { orderType: 'B2C', paymentType: 'PREPAID' },
  });

  const [length, breadth, height, actualWeight, paymentType] = watch([
    'length', 'breadth', 'height', 'actualWeight', 'paymentType',
  ]);
  const volumetricWeight = length && breadth && height
    ? (length * breadth * height) / 5000
    : 0;

  const detectPickupZone = async () => {
    const pincode = getValues('pickupPincode');
    if (pincode?.length === 6) {
      setLoadingPickupZone(true);
      const z = await zoneService.detectZoneByPincode(pincode);
      setPickupZone(z);
      setLoadingPickupZone(false);
    }
  };

  const detectDropZone = async () => {
    const pincode = getValues('dropPincode');
    if (pincode?.length === 6) {
      setLoadingDropZone(true);
      const z = await zoneService.detectZoneByPincode(pincode);
      setDropZone(z);
      setLoadingDropZone(false);
    }
  };

  const fetchPricing = async () => {
    const vals = getValues();
    setLoadingPrice(true);
    setPricingError('');
    try {
      const result = await orderService.calculatePrice({
        pickupPincode: vals.pickupPincode,
        dropPincode: vals.dropPincode,
        length: vals.length,
        breadth: vals.breadth,
        height: vals.height,
        actualWeight: vals.actualWeight,
        orderType: vals.orderType,
        paymentType: vals.paymentType,
        codAmount: vals.codAmount,
      });
      setPricing(result);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setPricingError(e?.response?.data?.message ?? 'Could not calculate price');
    } finally {
      setLoadingPrice(false);
    }
  };

  const validateStep = async (): Promise<boolean> => {
    const fieldMap: Record<number, (keyof FormData)[]> = {
      0: ['pickupAddress', 'pickupPincode'],
      1: ['dropAddress', 'dropPincode'],
      2: ['length', 'breadth', 'height', 'actualWeight'],
      3: ['orderType', 'paymentType'],
    };
    const fields = fieldMap[step];
    if (!fields) return true;
    return trigger(fields);
  };

  const next = async () => {
    const valid = await validateStep();
    if (!valid) return;
    if (step === 3) {
      fetchPricing();
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  const onSubmit = async (data: FormData) => {
    if (!pricing) {
      toast.error('Price calculation failed, cannot submit');
      return;
    }
    try {
      const order = await orderService.createOrder(data);
      toast.success(`Order #${order.orderNumber} created!`);
      setTimeout(() => navigate(`/customer/orders/${order.id}`), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Failed to create order');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-500 text-sm mt-1">
          Fill in the delivery details step by step
        </p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}
              >
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span className="text-[10px] text-gray-500 mt-1 hidden sm:block whitespace-nowrap">
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 transition-colors ${i < step ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-5">
            Step {step + 1}: {steps[step]}
          </h2>

          {/* Step 0: Pickup Details */}
          {step === 0 && (
            <div className="space-y-4">
              <Input
                label="Pickup Address"
                placeholder="123 Main St, Building A"
                error={errors.pickupAddress?.message}
                required
                {...register('pickupAddress')}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Pickup Pincode"
                    placeholder="400001"
                    maxLength={6}
                    error={errors.pickupPincode?.message}
                    required
                    {...register('pickupPincode')}
                    onBlur={detectPickupZone}
                  />
                  {loadingPickupZone && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Detecting zone...
                    </p>
                  )}
                  {pickupZone && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Zone: {pickupZone.name}
                    </p>
                  )}
                  {!loadingPickupZone && !pickupZone && getValues('pickupPincode')?.length === 6 && (
                    <p className="text-xs text-yellow-600 mt-1">⚠ No zone found</p>
                  )}
                </div>
                <Input
                  label="Pickup City"
                  placeholder="Mumbai"
                  {...register('pickupCity')}
                />
              </div>
            </div>
          )}

          {/* Step 1: Drop Details */}
          {step === 1 && (
            <div className="space-y-4">
              <Input
                label="Drop Address"
                placeholder="456 Park Ave, Floor 2"
                error={errors.dropAddress?.message}
                required
                {...register('dropAddress')}
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Drop Pincode"
                    placeholder="110001"
                    maxLength={6}
                    error={errors.dropPincode?.message}
                    required
                    {...register('dropPincode')}
                    onBlur={detectDropZone}
                  />
                  {loadingDropZone && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Detecting zone...
                    </p>
                  )}
                  {dropZone && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Zone: {dropZone.name}
                    </p>
                  )}
                </div>
                <Input
                  label="Drop City"
                  placeholder="Delhi"
                  {...register('dropCity')}
                />
              </div>
              {pickupZone && dropZone && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-700">
                  Route:{' '}
                  <strong>
                    {pickupZone.id === dropZone.id ? 'INTRA-ZONE' : 'INTER-ZONE'}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Package Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Length (cm)"
                  type="number"
                  step="0.1"
                  placeholder="30"
                  error={errors.length?.message}
                  required
                  {...register('length')}
                />
                <Input
                  label="Breadth (cm)"
                  type="number"
                  step="0.1"
                  placeholder="20"
                  error={errors.breadth?.message}
                  required
                  {...register('breadth')}
                />
                <Input
                  label="Height (cm)"
                  type="number"
                  step="0.1"
                  placeholder="15"
                  error={errors.height?.message}
                  required
                  {...register('height')}
                />
              </div>
              <Input
                label="Actual Weight (kg)"
                type="number"
                step="0.01"
                placeholder="2.5"
                error={errors.actualWeight?.message}
                required
                {...register('actualWeight')}
              />
              {volumetricWeight > 0 && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 text-sm">
                  <p className="text-indigo-700">
                    Volumetric Weight:{' '}
                    <strong>{volumetricWeight.toFixed(2)} kg</strong>
                    <span className="text-xs text-indigo-500 ml-2">
                      (L × B × H / 5000)
                    </span>
                  </p>
                  <p className="text-indigo-600 text-xs mt-1">
                    Billable weight: <strong>{Math.max(actualWeight || 0, volumetricWeight).toFixed(2)} kg</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Order Details */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['B2C', 'B2B'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 border-gray-200"
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('orderType')}
                        className="text-primary-600"
                      />
                      <span className="font-medium text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(['PREPAID', 'COD'] as const).map((type) => (
                    <label
                      key={type}
                      className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 border-gray-200"
                    >
                      <input
                        type="radio"
                        value={type}
                        {...register('paymentType')}
                        className="text-primary-600"
                      />
                      <span className="font-medium text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {paymentType === 'COD' && (
                <Input
                  label="COD Amount (₹)"
                  type="number"
                  step="0.01"
                  placeholder="1000"
                  error={errors.codAmount?.message}
                  {...register('codAmount')}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Special instructions, fragile item, etc."
                  className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  {...register('remarks')}
                />
              </div>
            </div>
          )}

          {/* Step 4: Price Preview */}
          {step === 4 && (
            <div>
              {loadingPrice ? (
                <div className="flex items-center justify-center py-12 gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Calculating price...</span>
                </div>
              ) : pricingError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{pricingError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={fetchPricing}
                  >
                    Retry
                  </Button>
                </div>
              ) : pricing ? (
                <PriceBreakdown
                  breakdown={pricing}
                  originAddress={getValues('pickupAddress')}
                  destinationAddress={getValues('dropAddress')}
                  dimensions={{
                    length: Number(getValues('length')) || 30,
                    breadth: Number(getValues('breadth')) || 20,
                    height: Number(getValues('height')) || 15,
                  }}
                />
              ) : null}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={prev}
              disabled={step === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                onClick={next}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={!pricing || !!pricingError}
                isLoading={isSubmitting}
              >
                Confirm Order
              </Button>
            )}
          </div>
        </Card>
      </form>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default CreateOrderPage;
