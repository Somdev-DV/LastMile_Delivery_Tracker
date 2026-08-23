import { prisma } from '../config/database';
import { OrderType, PaymentType, RouteType, RateBreakdown } from '../types';
import { zoneService } from './zoneService';

export interface RateCalculationInput {
  pickupPincode: string;
  pickupCity?: string;
  dropPincode: string;
  dropCity?: string;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
  codAmount?: number;
}

export class RateCalculationService {
  /**
   * Calculate volumetric weight in kg: (L * B * H in cm) / 5000
   */
  calculateVolumetricWeight(length: number, breadth: number, height: number): number {
    if (length <= 0 || breadth <= 0 || height <= 0) {
      throw new Error('Package dimensions (length, breadth, height) must be greater than 0.');
    }
    const vol = (length * breadth * height) / 5000;
    return Number(vol.toFixed(2));
  }

  /**
   * Billable weight is the higher of actual weight and volumetric weight
   */
  calculateBillableWeight(actualWeight: number, volumetricWeight: number): number {
    if (actualWeight <= 0) {
      throw new Error('Actual weight must be greater than 0.');
    }
    const billable = Math.max(actualWeight, volumetricWeight);
    return Number(billable.toFixed(2));
  }

  /**
   * Core Rate Calculation Engine
   */
  async calculateRate(input: RateCalculationInput): Promise<RateBreakdown> {
    const {
      pickupPincode,
      pickupCity,
      dropPincode,
      dropCity,
      length,
      breadth,
      height,
      actualWeight,
      orderType,
      paymentType,
      codAmount = 0,
    } = input;

    // 1. Zone detection
    const pickupZone = await zoneService.detectZone(pickupPincode, pickupCity);
    if (!pickupZone) {
      throw new Error(`Pickup location (pincode: ${pickupPincode}) is not mapped to any active delivery zone.`);
    }

    const dropZone = await zoneService.detectZone(dropPincode, dropCity);
    if (!dropZone) {
      throw new Error(`Drop location (pincode: ${dropPincode}) is not mapped to any active delivery zone.`);
    }

    // 2. Determine Route Type
    const routeType = zoneService.getRouteType(pickupZone.id, dropZone.id);

    // 3. Calculate Volumetric & Billable Weight
    const volumetricWeight = this.calculateVolumetricWeight(length, breadth, height);
    const billableWeight = this.calculateBillableWeight(actualWeight, volumetricWeight);

    // 4. Rate Card Lookup (check zone-specific first, fallback to generic global)
    let rateCard = await prisma.rateCard.findFirst({
      where: {
        orderType,
        routeType,
        zoneId: pickupZone.id,
        isActive: true,
      },
    });

    if (!rateCard) {
      rateCard = await prisma.rateCard.findFirst({
        where: {
          orderType,
          routeType,
          zoneId: null,
          isActive: true,
        },
      });
    }

    if (!rateCard) {
      throw new Error(
        `No active rate card configured for ${orderType} ${routeType} delivery from ${pickupZone.name} to ${dropZone.name}.`
      );
    }

    // 5. Weight Charge Calculation
    // Base rate covers up to minWeight; extra weight is charged per kg
    const extraWeight = Math.max(0, billableWeight - rateCard.minWeight);
    const weightCharge = Number((extraWeight * rateCard.perKgRate).toFixed(2));
    const baseRate = Number(rateCard.baseRate.toFixed(2));

    // 6. COD Surcharge Calculation
    let codSurcharge = 0;
    if (paymentType === PaymentType.COD) {
      const codConfig = await prisma.codSurcharge.findUnique({
        where: { orderType },
      });

      if (!codConfig || !codConfig.isActive) {
        throw new Error(`No active COD surcharge configuration found for ${orderType} orders.`);
      }

      if (codAmount <= 0) {
        throw new Error('COD orders must have a valid COD amount to collect greater than 0.');
      }

      const calculatedCodFee = (codAmount * codConfig.percentage) / 100;
      codSurcharge = Number(Math.max(codConfig.flatAmount, calculatedCodFee).toFixed(2));
    }

    // 7. Final Delivery Charge
    const totalCharge = Number((baseRate + weightCharge + codSurcharge).toFixed(2));

    const breakdownDescription =
      `Base: ₹${baseRate.toFixed(2)} (${rateCard.minWeight}kg incl) + ` +
      `Extra Weight: ₹${weightCharge.toFixed(2)} (${extraWeight.toFixed(2)}kg @ ₹${rateCard.perKgRate}/kg)` +
      (paymentType === PaymentType.COD ? ` + COD Surcharge: ₹${codSurcharge.toFixed(2)}` : '') +
      ` = Total: ₹${totalCharge.toFixed(2)}`;

    return {
      actualWeight: Number(actualWeight.toFixed(2)),
      volumetricWeight,
      billableWeight,
      pickupZoneId: pickupZone.id,
      pickupZoneName: pickupZone.name,
      dropZoneId: dropZone.id,
      dropZoneName: dropZone.name,
      routeType,
      orderType,
      paymentType,
      baseRate,
      weightCharge,
      codSurcharge,
      totalCharge,
      rateCardId: rateCard.id,
      breakdown: breakdownDescription,
    };
  }
}

export const rateCalculationService = new RateCalculationService();
