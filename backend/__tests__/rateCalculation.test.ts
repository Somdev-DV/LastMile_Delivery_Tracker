import { rateCalculationService } from '../src/services/rateCalculationService';

describe('Rate Calculation Engine Unit Tests', () => {
  describe('Volumetric Weight Formula', () => {
    it('should calculate volumetric weight correctly: (L * B * H) / 5000', () => {
      // 50 x 40 x 30 = 60,000 / 5000 = 12 kg
      const vol = rateCalculationService.calculateVolumetricWeight(50, 40, 30);
      expect(vol).toBe(12);
    });

    it('should calculate small dimensions correctly', () => {
      // 20 x 15 x 10 = 3000 / 5000 = 0.6 kg
      const vol = rateCalculationService.calculateVolumetricWeight(20, 15, 10);
      expect(vol).toBe(0.6);
    });

    it('should throw error for non-positive dimensions', () => {
      expect(() => rateCalculationService.calculateVolumetricWeight(0, 40, 30)).toThrow();
      expect(() => rateCalculationService.calculateVolumetricWeight(50, -10, 30)).toThrow();
    });
  });

  describe('Billable Weight Selection', () => {
    it('should pick volumetric weight when volumetric > actual', () => {
      const actualWeight = 4.0;
      const volumetricWeight = 6.0;
      const billable = rateCalculationService.calculateBillableWeight(actualWeight, volumetricWeight);
      expect(billable).toBe(6.0);
    });

    it('should pick actual weight when actual > volumetric', () => {
      const actualWeight = 8.5;
      const volumetricWeight = 3.2;
      const billable = rateCalculationService.calculateBillableWeight(actualWeight, volumetricWeight);
      expect(billable).toBe(8.5);
    });

    it('should return equal weight when actual == volumetric', () => {
      const billable = rateCalculationService.calculateBillableWeight(5.0, 5.0);
      expect(billable).toBe(5.0);
    });

    it('should throw error for non-positive actual weight', () => {
      expect(() => rateCalculationService.calculateBillableWeight(0, 5.0)).toThrow();
      expect(() => rateCalculationService.calculateBillableWeight(-2, 5.0)).toThrow();
    });
  });
});
