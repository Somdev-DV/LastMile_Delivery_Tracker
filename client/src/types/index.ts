export type Role = 'CUSTOMER' | 'DELIVERY_AGENT' | 'ADMIN';
export type OrderStatus =
  | 'CREATED'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'
  | 'RESCHEDULED'
  | 'CANCELLED';
export type OrderType = 'B2B' | 'B2C';
export type PaymentType = 'PREPAID' | 'COD';
export type RouteType = 'INTRA_ZONE' | 'INTER_ZONE';
export type AgentAvailability = 'AVAILABLE' | 'BUSY' | 'OFFLINE';
export type NotificationChannel = 'EMAIL' | 'SMS';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  agentProfile?: DeliveryAgent;
  customerProfile?: CustomerProfile;
}

export interface CustomerProfile {
  id: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface DeliveryAgent {
  id: string;
  userId: string;
  availability: AgentAvailability;
  latitude?: number;
  longitude?: number;
  zoneId?: string;
  vehicleType?: string;
  isActive: boolean;
  zone?: Zone;
  user?: User;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  areas?: Area[];
}

export interface Area {
  id: string;
  name: string;
  pincode: string;
  city?: string;
  zoneId: string;
}

export interface RateCard {
  id: string;
  zoneId?: string;
  orderType: OrderType;
  routeType: RouteType;
  baseRate: number;
  perKgRate: number;
  minWeight: number;
  isActive: boolean;
  zone?: Zone;
}

export interface CodSurcharge {
  id: string;
  orderType: OrderType;
  percentage: number;
  flatAmount: number;
  isActive: boolean;
}

export interface RateBreakdown {
  actualWeight: number;
  volumetricWeight: number;
  billableWeight: number;
  pickupZone: string;
  dropZone: string;
  routeType: RouteType;
  orderType: OrderType;
  paymentType: PaymentType;
  baseRate: number;
  weightCharge: number;
  codSurcharge: number;
  totalCharge: number;
  rateCardId: string;
  breakdown?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  pickupAddress: string;
  pickupPincode: string;
  pickupCity?: string;
  dropAddress: string;
  dropPincode: string;
  dropCity?: string;
  pickupZoneId?: string;
  dropZoneId?: string;
  length: number;
  breadth: number;
  height: number;
  actualWeight: number;
  volumetricWeight: number;
  billableWeight: number;
  orderType: OrderType;
  paymentType: PaymentType;
  codAmount?: number;
  baseRate?: number;
  weightCharge?: number;
  codSurcharge?: number;
  calculatedCharge?: number;
  status: OrderStatus;
  assignedAgentId?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  customer?: User;
  pickupZone?: Zone;
  dropZone?: Zone;
  assignedAgent?: DeliveryAgent;
  trackingEvents?: TrackingEvent[];
  attempts?: DeliveryAttempt[];
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  prevStatus?: OrderStatus;
  newStatus: OrderStatus;
  actorId: string;
  actorRole: Role;
  remarks?: string;
  timestamp: string;
  actor?: User;
}

export interface DeliveryAttempt {
  id: string;
  orderId: string;
  agentId: string;
  attemptNumber: number;
  status: 'ACTIVE' | 'COMPLETED' | 'FAILED';
  failureReason?: string;
  scheduledDate?: string;
  startedAt: string;
  completedAt?: string;
  agent?: DeliveryAgent;
}

export interface DeliveryAssignment {
  id: string;
  orderId: string;
  agentId: string;
  method: 'MANUAL' | 'AUTO';
  reasoning?: string;
  assignedAt: string;
  isActive: boolean;
  agent?: DeliveryAgent;
}

export interface Notification {
  id: string;
  orderId: string;
  userId: string;
  channel: NotificationChannel;
  event: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  message: string;
  sentAt?: string;
  createdAt: string;
  order?: Order;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  outForDeliveryOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  availableAgents: number;
  busyAgents: number;
  unassignedOrders: number;
}

export interface AssignmentResult {
  agent: DeliveryAgent;
  distance?: number;
  agentZone?: string;
  method: 'MANUAL' | 'AUTO';
  reasoning: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
