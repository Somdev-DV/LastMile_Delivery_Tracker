import { haversineDistance } from '../src/utils/haversine';

describe('Haversine Geographic Distance Formula Tests', () => {
  it('should calculate accurate distance between Bangalore landmarks', () => {
    // MG Road (12.9716, 77.5946) to Indiranagar (12.9784, 77.6408) is ~5.0 km
    const dist = haversineDistance(12.9716, 77.5946, 12.9784, 77.6408);
    expect(dist).toBeGreaterThan(4.5);
    expect(dist).toBeLessThan(5.5);
  });

  it('should return 0 km for identical coordinates', () => {
    const dist = haversineDistance(12.9716, 77.5946, 12.9716, 77.5946);
    expect(dist).toBe(0);
  });

  it('should calculate distance between Bangalore and Whitefield', () => {
    // Central Bangalore to Whitefield (~16-18 km)
    const dist = haversineDistance(12.9716, 77.5946, 12.9698, 77.75);
    expect(dist).toBeGreaterThan(15);
    expect(dist).toBeLessThan(20);
  });
});
