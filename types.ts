export enum Role {
  Admin = 'admin',
  Driver = 'driver',
  Vendor = 'vendor',
  LodgingPartner = 'lodging',
  Agent = 'agent',
  Member = 'member',
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
  JeepTourOperator = 'Jeep Tour Operator',
  BusRental = 'Bus Rental',
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
  isMaintenanceMode?: boolean;
}

export interface RentalDetails {
  isAvailableForRental: boolean;
  dailyRate?: number;
  weeklyRate?: number;
}

// --- New types for Lodging Management ---
export interface RoomPhoto {
  url: string; // URL
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
  mainImage: string; // URL
  thumbnails: string[]; // array of 3 URLs
  isAvailable: boolean;
  amenities: RoomAmenities;
  specialOffer: {
    enabled: boolean;
    discountPercentage: number;
  };
}

// --- New types for Massage Partners ---
export interface MassagePrice {
  id: string;
  duration: number; // in minutes
  price: number; // in IDR
}

export interface GalleryPhoto {
  id: string;
  url: string; // URL
  name: string; // caption
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
  massagePricing?: MassagePrice[];
  galleryImages?: GalleryPhoto[]; // for massage places
  amenities?: {
    sauna?: boolean;
    jacuzzi?: boolean;
    salon?: boolean;
    nailArt?: boolean;
    steamRoom?: boolean;
  };
  otherAmenities?: string;
  businessHours?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };

  // --- New Lodging Partner Fields ---
  description?: string; // Detailed property description
  address?: string; // e.g., "Ubud"
  street?: string;
  photos?: RoomPhoto[];
  checkInTime?: string; // e.g., "14:00"
  airportPickup?: boolean;
  loyaltyRewardEnabled?: boolean;
  hotelVillaAmenities?: HotelVillaAmenities;
  agentId?: string; // New field to link partner to an agent

  // --- New Driver Performance Fields ---
  acceptanceRate?: number; // percentage
  cancellationRate?: number; // percentage

  // --- New Private fields for Massage Therapists ---
  privateInfo?: {
    legalName?: string;
    personalAddress?: string;
    idCardImage?: string; // URL
    experienceYears?: number;
    age?: number;
    gender?: 'male' | 'female' | 'other';
    religion?: string;
    noCriminalRecord?: boolean;
    agreedToTerms?: boolean;
  }
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
  prospectId?: string;
}

export interface VendorItem {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  imageUrl: string;
  description?: string; // Short description
  longDescription?: string; // Detailed description for directory
  category?: string;
  chiliLevel?: number; // 0-4
  cookingTime?: number; // in minutes
}

export interface Transaction {
  id: string;
  partnerId: string;
  date: string;
  type: 'Ride' | 'Delivery' | 'Order' | 'Rental' | 'Hire' | 'Wellness' | 'Booking';
  amount: number;
  status: 'completed' | 'cancelled' | 'in_progress';
  details: string; // e.g., "Trip from A to B" or "Nasi Goreng x2"
  breakdown?: {
    baseFare: number;
    tip?: number;
    bonus?: number;
    platformFee: number;
  };
}

export interface AdminStats {
  totalPartners: number;
  pendingApplications: number;
  activeDrivers: number;
  activeVendorsAndBusinesses: number;
  pendingRenewals: number;
  pendingAgentSignups: number;
  pendingAgentApplications: number;
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
  imageUrl?: string;
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
  receiptImage: string; // URL
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

export enum VehicleType {
  Bike = 'Bike',
  Jeep = 'Jeep',
  Car = 'Car',
  Bus = 'Bus',
  Lorry = 'Lorry',
}

export interface TourPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  includes: string[];
}

export interface Vehicle {
  id: string;
  partnerId?: string; // Link to Partner
  type: VehicleType;
  serviceType: 'ride' | 'tour';
  driver: string;
  driverImage: string; // URL
  driverRating: number;
  name: string; // Model name (e.g., "Honda Vario", "Willys Jeep")
  plate: string;
  isAvailable: boolean;
  zone?: Zone; // Optional, might not apply to Jeeps
  pricePerKm?: number; // Optional, for ride-hailing
  pricePerKmParcel?: number; // Optional, for ride-hailing
  whatsapp?: string;
  modelCc?: string; // Optional, for bikes
  color?: string;
  registrationYear?: number;
  pricePerDay?: number; // Keep for simple rentals, but tours are preferred for Jeeps
  bankDetails: {
    bankName: string;
    accountHolder: string;
    accountNumber: string;
  };
  // New fields for Jeeps
  seats?: number; // Max passengers
  tourPackages?: TourPackage[];
  associatedDestinationID?: string;
  operatingHours?: string;

  // New fields for Sales
  listingType?: 'rent' | 'sale' | 'both';
  salePrice?: number;
}

// --- New type for end-user management ---
export interface Member {
  id: string;
  whatsappNumber: string;
  name?: string;
  email: string;
  lastKnownLocation: string;
  createdAt: string; // ISO Date string
  status: 'active' | 'suspended' | 'warned';
}

// --- New types for Agent Management ---
export interface Prospect {
  id: string;
  agentId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  street: string;
  partnerType: PartnerType;
  meetingNotes: string;
  meetingDateTime: string; // ISO Date string
  callbackDateTime?: string; // ISO Date string
  status: 'prospect' | 'agreed_to_join' | 'pending_approval' | 'active_partner';
  createdAt: string; // ISO Date string
}

export interface AgentApplication {
  id: string;
  name: string;
  email: string;
  nik: string; // ID personal number
  age: number;
  whatsapp: string;
  address: string;
  lastJob: string;
  transport: 'own' | 'borrowed';
  equipment: ('laptop' | 'phone')[];
  shirtSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  policeRecord: boolean;
  idCardImage: string; // URL
  profilePhotoImage: string; // URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO Date string
}

// --- New types for Food Directory ---
export enum FoodTypeCategory {
  RiceAndNoodle = 'Rice and Noodle Dishes',
  SavorySnacks = 'Savory Snacks & Fritters',
  TraditionalRegional = 'Traditional & Regional Dishes',
  DrinksDesserts = 'Drinks & Desserts',
}

export interface FoodType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: FoodTypeCategory;
  isEnabled?: boolean;
}

// --- New types for Massage Directory ---
export enum MassageTypeCategory {
  Western = 'Western Massages',
  EasternIndonesian = 'Eastern & Indonesian Massages',
  TraditionalIndonesian = 'Traditional Indonesian Techniques',
  Specialty = 'Specialty Massages',
}

export interface MassageType {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: MassageTypeCategory;
  isEnabled?: boolean;
}

// --- New types for Driver Dashboard ---
export interface Feedback {
  id: string;
  rating: number;
  comment?: string;
  date: string; // ISO date string
}

export interface Payout {
  id: string;
  date: string; // ISO date string
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  bankName: string;
  accountNumberLast4: string;
}