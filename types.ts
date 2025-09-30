export enum Role {
  Admin = 'admin',
  Driver = 'driver',
  Vendor = 'vendor',
}

export enum PartnerType {
  BikeDriver = 'Bike Driver',
  CarDriver = 'Car Driver',
  LorryDriver = 'Lorry Driver',
  FoodVendor = 'Food Vendor',
  StreetShop = 'Street Shop',
  CarRental = 'Car Rental',
  BikeRental = 'Bike Rental',
  LocalBusiness = 'Local Business',
}

export interface UserProfile {
  name?: string;
  profilePicture?: string;
  shopName?: string;
  vehicle?: {
    type: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

export interface User {
  id: string;
  email: string;
  role: Role;
  profile: UserProfile;
  partnerType?: PartnerType;
}

export interface Partner extends User {
  partnerType: PartnerType;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
  totalEarnings: number;
  memberSince: string;
  phone: string;
  activationExpiry?: string; // ISO Date string
  // Rate settings
  rideRatePerKm?: number;
  minFare?: number;
  parcelRatePerKm?: number;
  hourlyHireRate?: number;
  dailyHireRate?: number;
  tourRates?: { [destinationId: string]: number };
}

export interface PartnerApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  partnerType: PartnerType;
  documents: {
    eKtp: string;
    sim?: string; // Optional for non-drivers
    stnk?: string; // Optional for non-drivers
    skck: string;
    businessLicense?: string; // Optional for businesses
  };
  vehicle?: {
    type: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
  };
}

export interface VendorItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
}

export interface Transaction {
  id: string;
  partnerId: string;
  date: string;
  type: 'Ride' | 'Delivery' | 'Order' | 'Rental' | 'Hire';
  amount: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  details: string; // e.g., "Trip from A to B" or "Nasi Goreng x2"
}

export interface AdminStats {
  totalPartners: number;
  pendingApplications: number;
  activeDrivers: number;
  activeVendorsAndBusinesses: number;
}

export interface AnalyticsSummary {
  partnerGrowth: {
    total: number;
    change: number; // percentage
  };
  rideAndOrderVolume: {
    total: number;
    change: number; // percentage
  };
  popularServices: { name: PartnerType; count: number }[];
  peakHours: { hour: string; count: number }[];
}

export interface RideRequest {
  id: string;
  pickupLocation: string;
  destination: string;
  fare: number;
  customerName: string;
  customerRating: number;
}

export interface AdminMessage {
  id: string;
  senderId: string; // e.g. 'admin-1'
  recipientId: string | 'all'; // partner id or 'all' for broadcast
  content: string;
  sentAt: string; // ISO Date string
  readBy: string[]; // Array of partner IDs who have read it
}

export interface TourDestination {
  id: string;
  name: string;
  category: 'Temples & Historical Sites' | 'Nature & Outdoors' | 'Culture & Art';
  description: string;
}