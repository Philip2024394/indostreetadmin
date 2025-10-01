export enum Role {
  Admin = 'admin',
  Driver = 'driver',
  Vendor = 'vendor',
  LodgingPartner = 'lodging',
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
  MassageTherapist = 'Massage Therapist',
  MassagePlace = 'Massage Place',
  Hotel = 'Hotel',
  Villa = 'Villa',
}

export interface UserProfile {
  name?: string;
  profilePicture?: string; // Corresponds to Logo for lodging
  headerPicture?: string; // Corresponds to Header Image for lodging
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

export interface RentalDetails {
  isAvailableForRental: boolean;
  dailyRate?: number;
  weeklyRate?: number;
}

// --- New types for Lodging Management ---
export interface RoomPhoto {
  url: string; // base64 or URL
  name: string; // caption
}

export interface RoomAmenities {
  privatePool?: boolean;
  balcony?: boolean;
  seaView?: boolean;
  kitchenette?: boolean;
  jacuzziTub?: boolean;
}

export interface HotelVillaAmenities {
  // Guest Room
  wifi?: boolean;
  tv?: boolean;
  airConditioning?: boolean;
  kitchen?: boolean;
  // Services
  pool?: boolean;
  restaurantBar?: boolean;
  fitnessCenter?: boolean;
  parking?: boolean;
  // Wellness
  spa?: boolean;
  saunaSteamRoom?: boolean;
  yogaClasses?: boolean;
  // Family
  kidsClub?: boolean;
  babysitting?: boolean;
  // Other
  petFriendly?: boolean;
  shuttleService?: boolean;
}

export interface Room {
  id: string;
  vendorId: string;
  name: string;
  pricePerNight: number;
  mainImage: string; // base64 or URL
  thumbnails: string[]; // array of 3 base64/URLs
  isAvailable: boolean;
  amenities: RoomAmenities;
  specialOffer: {
    enabled: boolean;
    discountPercentage: number;
  };
}


export interface Partner extends User {
  partnerType: PartnerType;
  status: 'active' | 'pending' | 'suspended';
  rating: number;
  totalEarnings: number;
  memberSince: string;
  phone: string; // Also used for WhatsApp
  activationExpiry?: string; // ISO Date string
  // Rate settings
  rideRatePerKm?: number;
  minFare?: number;
  parcelRatePerKm?: number;
  hourlyHireRate?: number;
  dailyHireRate?: number;
  tourRates?: { [destinationId: string]: number };
  bankDetails?: {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
  };
  rentalDetails?: RentalDetails;
  // Massage specific fields
  bio?: string; // Also used for Lodging Tagline
  massageStatus?: 'online' | 'busy' | 'offline';
  massageServices?: string[];
  massagePricing?: {
    '60min'?: number;
    '90min'?: number;
    '120min'?: number;
  };
  galleryImages?: string[]; // array of base64 strings or URLs, for massage places
  amenities?: {
    sauna?: boolean;
    jacuzzi?: boolean;
    salon?: boolean;
    nailArt?: boolean;
    steamRoom?: boolean;
  };
  otherAmenities?: string;
  businessHours?: string;

  // --- New Lodging Partner Fields ---
  description?: string; // Detailed property description
  address?: string; // e.g., "Ubud"
  street?: string;
  photos?: RoomPhoto[];
  checkInTime?: string; // e.g., "14:00"
  airportPickup?: boolean;
  loyaltyRewardEnabled?: boolean;
  hotelVillaAmenities?: HotelVillaAmenities;
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
  type: 'Ride' | 'Delivery' | 'Order' | 'Rental' | 'Hire' | 'Wellness' | 'Booking';
  amount: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  details: string; // e.g., "Trip from A to B" or "Nasi Goreng x2"
}

export interface AdminStats {
  totalPartners: number;
  pendingApplications: number;
  activeDrivers: number;
  activeVendorsAndBusinesses: number;
  pendingRenewals: number;
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

export interface ContentOverrides {
  text: Record<string, string>;
  numbers: Record<string, number>;
  assets: Record<string, string>; // base64 strings
}

export const PaymentMethods = ['Bank Transfer', 'Indomaret', 'Alfamart', 'GoPay', 'OVO', 'ShopeePay'] as const;
export type PaymentMethod = typeof PaymentMethods[number];

export interface RenewalSubmission {
  id: string;
  partnerId: string;
  partnerName: string; // denormalized for easier display
  submittedAt: string; // ISO Date string
  selectedPackage: 3 | 6 | 12; // months
  transactionNumber: string;
  paymentMethod: PaymentMethod;
  receiptImage: string; // base64 string
  status: 'pending' | 'approved' | 'rejected';
  amountPaid: number;
  approvedAt?: string; // ISO date string
}

// --- New types for Bike Fleet Management ---
export enum Zone {
  Zone1 = 'Zone 1: Sumatra, Java (non-Jakarta), Bali',
  Zone2 = 'Zone 2: Greater Jakarta (Jabodetabek)',
  Zone3 = 'Zone 3: Kalimantan, Sulawesi, NTT, Maluku, Papua',
}

export interface Vehicle {
  id: string;
  type: 'Bike';
  serviceType: 'ride';
  driver: string;
  driverImage: string; // URL
  driverRating: number;
  name: string; // Bike model name
  plate: string;
  isAvailable: boolean;
  zone: Zone;
  pricePerKm: number;
  pricePerKmParcel: number;
  whatsapp?: string;
  modelCc?: string;
  color?: string;
  registrationYear?: number;
  pricePerDay?: number;
  bankDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  };
}