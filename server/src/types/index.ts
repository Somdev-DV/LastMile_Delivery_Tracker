import {
  Role,
  OrderStatus,
  OrderType,
  PaymentType,
  RouteType,
  NotificationChannel,
  AssignmentMethod,
  AgentAvailability,
} from '@prisma/client';

export { Role, OrderStatus, OrderType, PaymentType, RouteType, NotificationChannel, AssignmentMethod, AgentAvailability };

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface RateBreakdown {
  actualWeight: number;
  volumetricWeight: number;
  billableWeight: number;
  pickupZoneId: string;
  pickupZoneName: string;
  dropZoneId: string;
  dropZoneName: string;
  routeType: RouteType;
  orderType: OrderType;
  paymentType: PaymentType;
  baseRate: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  rateCardId: string;
  breakdown: string;
}

export interface AssignmentResult {
  agentId: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string | null;
  zoneId?: string | null;
  zoneName?: string | null;
  distanceKm?: number;
  method: AssignmentMethod;
  reasoning: string;
  assignmentId: string;
  attemptNumber: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  pickupZoneId?: string;
  dropZoneId?: string;
  agentId?: string;
  customerId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  orderType?: OrderType;
  paymentType?: PaymentType;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
