export type VehicleType = 'moto' | 'remis' | 'taxi';

export type TripStatus = 'requested' | 'accepted' | 'driver_en_route' | 'in_progress' | 'completed' | 'cancelled';

export interface LocationPoint {
  name: string;
  address: string;
  lat: number;
  lng: number;
  zoneId: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  vehicleType: VehicleType;
  vehicleModel: string;
  plate: string;
  color: string;
  rating: number;
  totalTrips: number;
  acceptanceRate: number;
  status: 'available' | 'busy' | 'offline';
  currentLocation: {
    lat: number;
    lng: number;
    zoneName: string;
  };
  tags: string[];
}

export interface PricingRule {
  vehicleType: VehicleType;
  baseFare: number;
  perKm: number;
  perMinute: number;
  minimumFare: number;
  commissionPercentage: number;
}

export interface PricingZone {
  id: string;
  name: string;
  center: { lat: number; lng: number };
  activeDemands: number;
  availableDrivers: {
    moto: number;
    remis: number;
    taxi: number;
  };
  surgeMultiplier: number; // e.g. 1.0 to 2.4
  isRainSurge: boolean;
  isPeakHour: boolean;
}

export interface TripQuote {
  vehicleType: VehicleType;
  displayName: string;
  description: string;
  etaMinutes: number;
  basePrice: number;
  surgeMultiplier: number;
  finalPrice: number;
  distanceKm: number;
  durationMin: number;
}

export interface Trip {
  id: string;
  orderNumber: string;
  channel: 'whatsapp' | 'app_ubinow';
  customerName: string;
  customerPhone: string;
  driverId: string;
  driverName: string;
  driverVehicle: string;
  driverPlate: string;
  vehicleType: VehicleType;
  origin: LocationPoint;
  destination: LocationPoint;
  distanceKm: number;
  durationMin: number;
  status: TripStatus;
  baseFare: number;
  surgeMultiplier: number;
  discountApplied: number;
  discountCode?: string;
  finalPrice: number;
  driverEarnings: number;
  ubinowFee: number;
  paymentMethod: 'cash' | 'mercadopago' | 'credit_card' | 'ubinow_wallet';
  createdAt: string;
  completedAt?: string;
  rating?: number;
  ratingFeedback?: string;
  ratingTags?: string[];
}

export interface PromotionCampaign {
  id: string;
  title: string;
  messageText: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  couponCode: string;
  targetAudience: 'all' | 'whatsapp_leads' | 'inactive_users' | 'zone_specific';
  targetZoneId?: string;
  channel: 'whatsapp_broadcast' | 'app_push' | 'both';
  status: 'active' | 'scheduled' | 'sent';
  sentAt?: string;
  recipientsCount: number;
  conversionCount: number;
  revenueGenerated: number;
}

export interface DriverRatingFeedback {
  id: string;
  tripId: string;
  driverId: string;
  driverName: string;
  customerName: string;
  stars: number;
  comment: string;
  tags: string[];
  createdAt: string;
}
