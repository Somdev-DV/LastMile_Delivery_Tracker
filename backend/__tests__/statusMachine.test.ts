import { isValidTransition, getAllowedTransitions } from '../src/utils/statusMachine';
import { OrderStatus } from '../src/types';

describe('Order Status Lifecycle Finite State Machine Tests', () => {
  it('should allow valid transitions in the delivery lifecycle', () => {
    expect(isValidTransition(OrderStatus.CREATED, OrderStatus.ASSIGNED)).toBe(true);
    expect(isValidTransition(OrderStatus.ASSIGNED, OrderStatus.PICKED_UP)).toBe(true);
    expect(isValidTransition(OrderStatus.PICKED_UP, OrderStatus.IN_TRANSIT)).toBe(true);
    expect(isValidTransition(OrderStatus.IN_TRANSIT, OrderStatus.OUT_FOR_DELIVERY)).toBe(true);
    expect(isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED)).toBe(true);
    expect(isValidTransition(OrderStatus.OUT_FOR_DELIVERY, OrderStatus.FAILED)).toBe(true);
    expect(isValidTransition(OrderStatus.FAILED, OrderStatus.RESCHEDULED)).toBe(true);
    expect(isValidTransition(OrderStatus.RESCHEDULED, OrderStatus.ASSIGNED)).toBe(true);
  });

  it('should reject invalid and nonsensical transitions', () => {
    // Cannot skip states
    expect(isValidTransition(OrderStatus.CREATED, OrderStatus.DELIVERED)).toBe(false);
    expect(isValidTransition(OrderStatus.CREATED, OrderStatus.IN_TRANSIT)).toBe(false);

    // Cannot reverse from DELIVERED
    expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.PICKED_UP)).toBe(false);
    expect(isValidTransition(OrderStatus.DELIVERED, OrderStatus.ASSIGNED)).toBe(false);

    // Cannot reschedule from IN_TRANSIT
    expect(isValidTransition(OrderStatus.IN_TRANSIT, OrderStatus.RESCHEDULED)).toBe(false);
  });

  it('should treat terminal states appropriately', () => {
    expect(getAllowedTransitions(OrderStatus.DELIVERED)).toEqual([]);
    expect(getAllowedTransitions(OrderStatus.CANCELLED)).toEqual([]);
  });
});
