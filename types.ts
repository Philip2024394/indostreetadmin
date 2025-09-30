
export enum Role {
  Admin = 'admin',
  Driver = 'driver',
  Vendor = 'vendor',
}

export enum PartnerType {
  BikeDriver = 'Bike Driver',
  CarDriver = 'Car Driver',
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
}

export interface Partner extends User {
  partnerType: PartnerType;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
  totalEarnings: number;
  memberSince: string;
  phone: string;
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
  type: 'Ride' | 'Delivery' | 'Order' | 'Rental';
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