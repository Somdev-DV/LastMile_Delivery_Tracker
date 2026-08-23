import React from 'react';
import type { RateBreakdown } from '../../types';
import { formatCurrency, formatWeight } from '../../utils/formatters';
import { Route, Scale, Receipt, Info, MapPin, CheckCircle2 } from 'lucide-react';

interface PriceBreakdownProps {
  breakdown: RateBreakdown;
  originAddress?: string;
  destinationAddress?: string;
  dimensions?: { length: number; breadth: number; height: number };
}

const PriceBreakdown: React.FC<PriceBreakdownProps> = ({
  breakdown,
  originAddress = 'Warehouse A, Industrial Park',
  destinationAddress = 'Retail Hub Central',
  dimensions = { length: 30, breadth: 20, height: 15 },
}) => {
  return (
    <div className="font-sans space-y-6">
      {/* Title */}
      <div className="border-b border-[#c5c6cd]/40 pb-4">
        <h2 className="font-headline text-xl sm:text-2xl font-bold text-[#191c1e] tracking-tight">
          Order Pricing Breakdown
        </h2>
        <p className="text-sm text-[#45474c] mt-1">
          Review the route details, package weight calculations, and estimated costs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Route & Weight Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Route Details Card */}
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#191c1e] mb-4 pb-3 border-b border-[#eceef0] flex items-center gap-2">
              <Route className="w-5 h-5 text-[#435c5b]" />
              Route Details
            </h3>

            <div className="relative pl-6 before:content-[''] before:absolute before:left-2 before:top-4 before:bottom-4 before:w-[2px] before:bg-[#c5c6cd]">
              {/* Origin */}
              <div className="relative mb-6">
                <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full border-2 border-[#435c5b] bg-white"></div>
                <div className="text-[11px] font-bold text-[#75777d] uppercase tracking-wider mb-0.5">
                  Origin (Pickup: {breakdown.pickupZone})
                </div>
                <div className="text-sm font-semibold text-[#191c1e]">{originAddress}</div>
              </div>

              {/* Destination */}
              <div className="relative">
                <div className="absolute -left-[27px] top-1 h-3.5 w-3.5 rounded-full bg-[#435c5b] flex items-center justify-center">
                  <div className="h-1 w-1 bg-white rounded-full"></div>
                </div>
                <div className="text-[11px] font-bold text-[#75777d] uppercase tracking-wider mb-0.5">
                  Destination (Drop: {breakdown.dropZone})
                </div>
                <div className="text-sm font-semibold text-[#191c1e]">{destinationAddress}</div>
              </div>
            </div>
          </div>

          {/* Weight Calculation Card */}
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 sm:p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#191c1e] mb-4 pb-3 border-b border-[#eceef0] flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#435c5b]" />
              Weight Calculation
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#f2f4f6] p-3.5 rounded-lg">
                <div className="text-xs font-medium text-[#75777d] mb-1">Actual Weight</div>
                <div className="text-xl font-bold text-[#191c1e]">
                  {formatWeight(breakdown.actualWeight)}
                </div>
              </div>

              <div className="bg-[#f2f4f6] p-3.5 rounded-lg">
                <div className="text-xs font-medium text-[#75777d] mb-1">Volumetric Weight</div>
                <div className="text-xl font-bold text-[#191c1e]">
                  {formatWeight(breakdown.volumetricWeight)}
                </div>
                <div className="text-[11px] text-[#75777d] mt-1">
                  L:{dimensions.length} × W:{dimensions.breadth} × H:{dimensions.height} cm
                </div>
              </div>
            </div>

            <div className="bg-[#defbf8]/40 p-3.5 rounded-lg border border-[#defbf8] flex items-start gap-2.5">
              <Info className="w-4 h-4 text-[#006444] shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-[#006444]">
                  Chargeable Weight: {formatWeight(breakdown.billableWeight)}
                </div>
                <div className="text-xs text-[#45474c] mt-0.5">
                  Pricing is calculated based on the greater of actual weight or volumetric weight.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cost Breakdown Card */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#c5c6cd]/60 rounded-xl p-5 sm:p-6 shadow-sm sticky top-20">
            <h3 className="text-base font-bold text-[#191c1e] mb-4 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#435c5b]" />
              Cost Breakdown
            </h3>

            <div className="space-y-3 mb-6 border-b border-[#eceef0] pb-4 text-sm">
              <div className="flex justify-between items-center text-[#45474c]">
                <span>Base Rate ({breakdown.routeType.replace('_', ' ')})</span>
                <span className="font-semibold text-[#191c1e]">
                  {formatCurrency(breakdown.baseRate)}
                </span>
              </div>

              <div className="flex justify-between items-center text-[#45474c]">
                <span>Weight Surcharge</span>
                <span className="font-semibold text-[#191c1e]">
                  {formatCurrency(breakdown.weightCharge)}
                </span>
              </div>

              {breakdown.codSurcharge > 0 && (
                <div className="flex justify-between items-center text-[#45474c]">
                  <span>COD Handling Fee</span>
                  <span className="font-semibold text-[#191c1e]">
                    {formatCurrency(breakdown.codSurcharge)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-[#45474c]">
                <span>Payment Type</span>
                <span className="font-semibold text-[#191c1e]">{breakdown.paymentType}</span>
              </div>
            </div>

            <div className="flex justify-between items-end mb-4">
              <div>
                <span className="text-[11px] font-bold text-[#75777d] uppercase tracking-wider block">
                  Total Estimated Cost
                </span>
                <span className="text-xs text-[#006444] font-medium">All taxes inclusive</span>
              </div>
              <div className="text-3xl font-extrabold text-[#435c5b]">
                {formatCurrency(breakdown.totalCharge)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;
