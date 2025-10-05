

import {
  User,
  Role,
  PartnerApplication,
  VendorItem,
  AdminStats,
  Partner,
  Transaction,
  AnalyticsSummary,
  RideRequest,
  AdminMessage,
  TourDestination,
  PartnerType,
  ContentOverrides,
  RenewalSubmission,
  PaymentMethod,
  Vehicle,
  Zone,
  Room,
  VehicleType,
  Member,
  Prospect,
  AgentApplication,
  MassagePrice,
  GalleryPhoto,
  MassageType,
  MassageTypeCategory,
  Feedback,
  Payout,
} from '../types';

// #region MOCK DATABASE
// This section contains a complete in-memory mock database to allow the app
// to function without a real backend. When the backend is ready, this section
// and the mock implementations of the API functions can be removed.

// A simple base64 encoded 1x1 transparent png
const tinyBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const slugifyPartnerType = (type: PartnerType): string => type.toLowerCase().replace(/\s+/g, '-');


let mockUsers: (User | Partner)[] = [
  {
    id: 'admin-1',
    email: 'admin@indostreet.com',
    role: Role.Admin,
    profile: { name: 'Admin IndoStreet', profilePicture: 'https://i.pravatar.cc/150?u=admin-1' },
  },
  {
    id: 'agent-1',
    email: 'agent@indostreet.com',
    role: Role.Agent,
    profile: { name: 'Joko Widodo', profilePicture: 'https://i.pravatar.cc/150?u=agent-1' },
  },
  {
    id: 'driver-1',
    email: 'driver@indostreet.com',
    role: Role.Driver,
    partnerType: PartnerType.BikeDriver,
    status: 'active',
    rating: 4.8,
    totalEarnings: 12500000,
    memberSince: '2022-01-15T09:00:00Z',
    phone: '081234567890',
    activationExpiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 5 days
    rideRatePerKm: 2600,
    minFare: 8000,
    bankDetails: { bankName: 'BCA', accountHolderName: 'Budi Santoso', accountNumber: '1234567890' },
    profile: {
      name: 'Budi Santoso',
      profilePicture: 'https://i.pravatar.cc/150?u=driver-1',
      vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'Vario 150', year: 2021, licensePlate: 'B 1234 ABC' },
    },
    agentId: 'agent-1',
    acceptanceRate: 95,
    cancellationRate: 2,
  },
  {
    id: 'driver-2',
    email: 'cardriver@indostreet.com',
    role: Role.Driver,
    partnerType: PartnerType.CarDriver,
    status: 'active',
    rating: 4.9,
    totalEarnings: 28750000,
    memberSince: '2021-11-20T09:00:00Z',
    phone: '081298765432',
    activationExpiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 90 days
    rideRatePerKm: 3800,
    minFare: 16000,
    rentalDetails: { isAvailableForRental: true, dailyRate: 350000, weeklyRate: 2100000 },
    tourRates: { 'tour-1': 250000, 'tour-2': 300000 },
    bankDetails: { bankName: 'Mandiri', accountHolderName: 'Citra Dewi', accountNumber: '0987654321' },
    profile: {
      name: 'Citra Dewi',
      profilePicture: 'https://i.pravatar.cc/150?u=driver-2',
      vehicle: { type: 'Car', brand: 'Toyota', model: 'Avanza', year: 2020, licensePlate: 'D 5678 XYZ' },
    },
    acceptanceRate: 98,
    cancellationRate: 1,
  },
  {
    id: 'vendor-1',
    email: 'vendor@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.FoodVendor,
    status: 'active',
    rating: 4.7,
    totalEarnings: 45200000,
    memberSince: '2022-03-10T09:00:00Z',
    phone: '085678901234',
    activationExpiry: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired 2 days ago
    bankDetails: { bankName: 'BRI', accountHolderName: 'Siti Aminah', accountNumber: '555666777' },
    profile: { name: 'Siti Aminah', shopName: 'Warung Nasi Ibu Siti', profilePicture: 'https://i.pravatar.cc/150?u=vendor-1' },
    agentId: 'agent-1',
  },
  {
    id: 'massage-therapist-1',
    email: 'therapist@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.MassageTherapist,
    status: 'active',
    rating: 4.9,
    totalEarnings: 15300000,
    memberSince: '2023-02-20T09:00:00Z',
    phone: '6281211112222',
    activationExpiry: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'BCA', accountHolderName: 'Indah Sari', accountNumber: '111222333' },
    profile: { name: 'Indah Sari', profilePicture: 'https://i.imgur.com/8kF9t6d.jpeg', headerPicture: 'https://via.placeholder.com/600x200/A7F3D0/14532D?Text=Relax+and+Rejuvenate' },
    bio: 'Certified massage therapist with 5 years of experience specializing in traditional Balinese and deep tissue massage. I bring a professional and relaxing experience to your home.',
    massageStatus: 'online',
    massageServices: ['Balinese Massage', 'Deep Tissue Massage', 'Reflexology'],
    massagePricing: [
      { id: 'price-1', duration: 60, price: 150000 },
      { id: 'price-2', duration: 90, price: 220000 },
      { id: 'price-3', duration: 120, price: 280000 },
    ],
  },
  {
    id: 'massage-place-1',
    email: 'spa@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.MassagePlace,
    status: 'active',
    rating: 4.8,
    totalEarnings: 98500000,
    memberSince: '2022-08-10T09:00:00Z',
    phone: '6287733334444',
    activationExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'Mandiri', accountHolderName: 'PT Sejahtera Spa', accountNumber: '444555666' },
    profile: { name: 'Serenity Spa', shopName: 'Serenity Spa Jakarta', profilePicture: 'https://i.imgur.com/Nrh5p6i.png', headerPicture: 'https://via.placeholder.com/600x200/BAE6FD/0C4A6E?Text=Your+Oasis+of+Calm' },
    bio: 'A luxurious day spa in the heart of Jakarta. We offer a wide range of wellness treatments, from traditional massages to modern spa packages. Visit us to escape the hustle and bustle.',
    address: 'Jakarta Selatan',
    street: 'Jl. Senopati No. 50',
    massageStatus: 'online',
    massageServices: ['Swedish Massage', 'Aromatherapy Massage', 'Hot Stone Massage', 'Cupping Therapy'],
    massagePricing: [
      { id: 'price-4', duration: 60, price: 250000 },
      { id: 'price-5', duration: 90, price: 350000 },
      { id: 'price-6', duration: 120, price: 450000 },
    ],
    galleryImages: [
        { id: 'gal-1', url: 'https://via.placeholder.com/400x300/E0F2FE/083344?Text=Treatment+Room', name: 'Comfortable Treatment Room' },
        { id: 'gal-2', url: 'https://via.placeholder.com/400x300/E0F2FE/083344?Text=Lobby', name: 'Welcoming Lobby' },
        { id: 'gal-3', url: 'https://via.placeholder.com/400x300/E0F2FE/083344?Text=Sauna', name: 'Relaxing Sauna' },
    ],
    amenities: { sauna: true, jacuzzi: true, salon: false, nailArt: false, steamRoom: true },
    businessHours: '10:00 AM - 9:00 PM Daily',
  },
  {
    id: 'hotel-1',
    email: 'hotel@indostreet.com',
    role: Role.LodgingPartner,
    partnerType: PartnerType.Hotel,
    status: 'active',
    rating: 4.8,
    totalEarnings: 1250000000,
    memberSince: '2022-06-01T09:00:00Z',
    phone: '6281122223333',
    activationExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'BCA', accountHolderName: 'PT Hotel Jaya Abadi', accountNumber: '999888777' },
    profile: { 
      name: 'Ubud Paradise Hotel',
      profilePicture: 'https://i.pravatar.cc/150?u=hotel-1', // Logo
      headerPicture: 'https://via.placeholder.com/800x200/6EE7B7/064E3B?Text=Ubud+Paradise+Hotel', // Header Image
    },
    bio: 'Your tranquil escape in the heart of Ubud.', // Tagline
    description: 'Nestled amidst lush rice paddies and tropical gardens, Ubud Paradise Hotel offers a serene retreat with luxurious amenities, world-class dining, and authentic Balinese hospitality. Experience the perfect blend of nature and comfort.',
    address: 'Ubud',
    street: 'Jl. Monkey Forest No.123',
    photos: [
      { url: 'https://via.placeholder.com/600x400/A7F3D0/14532D?Text=Lobby', name: 'Lobby & Reception' },
      { url: 'https://via.placeholder.com/600x400/A7F3D0/14532D?Text=Pool', name: 'Infinity Pool' },
      { url: 'https://via.placeholder.com/600x400/A7F3D0/14532D?Text=Restaurant', name: 'Garden Restaurant' },
    ],
    checkInTime: '14:00',
    airportPickup: true,
    loyaltyRewardEnabled: true,
    hotelVillaAmenities: {
      wifi: true,
      tv: true,
      airConditioning: true,
      pool: true,
      restaurantBar: true,
      fitnessCenter: true,
      parking: true,
      spa: true,
    },
  },
  {
    id: 'villa-1',
    email: 'villa@indostreet.com',
    role: Role.LodgingPartner,
    partnerType: PartnerType.Villa,
    status: 'active',
    rating: 4.9,
    totalEarnings: 850000000,
    memberSince: '2023-01-10T09:00:00Z',
    phone: '6289988887777',
    activationExpiry: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'Mandiri', accountHolderName: 'PT Villa Damai Sejahtera', accountNumber: '1212121212' },
    profile: { 
      name: 'Canggu Beachfront Villa',
      profilePicture: 'https://i.pravatar.cc/150?u=villa-1', // Logo
      headerPicture: 'https://via.placeholder.com/800x200/93C5FD/1E40AF?Text=Canggu+Beachfront+Villa', // Header Image
    },
    bio: 'Private luxury with stunning ocean views.', // Tagline
    description: 'Experience unparalleled luxury and privacy at our exclusive beachfront villa in Canggu. Featuring a private infinity pool, modern architecture, and direct beach access, it\'s the perfect getaway for families and groups seeking tranquility and style.',
    address: 'Canggu',
    street: 'Jl. Pantai Batu Bolong No. 456',
    photos: [
      { url: 'https://via.placeholder.com/600x400/BFDBFE/1E3A8A?Text=Living+Room', name: 'Open-plan Living Room' },
      { url: 'https://via.placeholder.com/600x400/BFDBFE/1E3A8A?Text=Private+Pool', name: 'Private Infinity Pool' },
      { url: 'https://via.placeholder.com/600x400/BFDBFE/1E3A8A?Text=Bedroom', name: 'Master Bedroom' },
    ],
    checkInTime: '15:00',
    airportPickup: true,
    loyaltyRewardEnabled: false,
    hotelVillaAmenities: {
      wifi: true,
      tv: true,
      airConditioning: true,
      kitchen: true,
      pool: true,
      parking: true,
      petFriendly: true,
    },
  },
  {
    id: 'jeep-driver-1',
    email: 'jeep@indostreet.com',
    role: Role.Driver,
    partnerType: PartnerType.JeepTourOperator,
    status: 'active',
    rating: 4.9,
    totalEarnings: 35000000,
    memberSince: '2023-05-10T09:00:00Z',
    phone: '081234567891',
    activationExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'BCA', accountHolderName: 'I Wayan Koster', accountNumber: '1111222233' },
    profile: {
      name: 'I Wayan Koster',
      profilePicture: 'https://i.pravatar.cc/150?u=jeep-driver-1',
    },
  },
  {
    id: 'lorry-driver-1',
    email: 'lorrydriver@indostreet.com',
    role: Role.Driver,
    partnerType: PartnerType.LorryDriver,
    status: 'active',
    rating: 4.6,
    totalEarnings: 42000000,
    memberSince: '2022-09-01T09:00:00Z',
    phone: '081311223344',
    activationExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'BNI', accountHolderName: 'Agus Setiawan', accountNumber: '2233445566' },
    profile: {
      name: 'Agus Setiawan',
      profilePicture: 'https://i.pravatar.cc/150?u=lorry-driver-1',
      vehicle: { type: 'Truck', brand: 'Mitsubishi', model: 'Canter', year: 2018, licensePlate: 'B 9876 CDE' },
    },
  },
  {
    id: 'street-shop-1',
    email: 'shop@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.StreetShop,
    status: 'active',
    rating: 4.5,
    totalEarnings: 18500000,
    memberSince: '2023-01-05T09:00:00Z',
    phone: '081511223344',
    activationExpiry: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'CIMB Niaga', accountHolderName: 'Rina Hartati', accountNumber: '7788990011' },
    profile: { name: 'Rina Hartati', shopName: 'Toko Kelontong Rina', profilePicture: 'https://i.pravatar.cc/150?u=street-shop-1' },
  },
  {
    id: 'car-rental-1',
    email: 'carrental@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.CarRental,
    status: 'active',
    rating: 4.8,
    totalEarnings: 75000000,
    memberSince: '2021-08-11T09:00:00Z',
    phone: '081611223344',
    activationExpiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'Danamon', accountHolderName: 'CV Maju Jaya Rental', accountNumber: '1122334455' },
    profile: { name: 'Maju Jaya Rental', shopName: 'Maju Jaya Car Rental', profilePicture: 'https://i.pravatar.cc/150?u=car-rental-1' },
  },
  {
    id: 'bike-rental-1',
    email: 'bikerental@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.BikeRental,
    status: 'active',
    rating: 4.7,
    totalEarnings: 32000000,
    memberSince: '2022-10-15T09:00:00Z',
    phone: '081711223344',
    activationExpiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'Permata', accountHolderName: 'Sewa Motor Kilat', accountNumber: '5566778899' },
    profile: { name: 'Sewa Motor Kilat', shopName: 'Sewa Motor Kilat Bali', profilePicture: 'https://i.pravatar.cc/150?u=bike-rental-1' },
  },
  {
    id: 'local-business-1',
    email: 'business@indostreet.com',
    role: Role.Vendor,
    partnerType: PartnerType.LocalBusiness,
    status: 'active',
    rating: 4.9,
    totalEarnings: 55000000,
    memberSince: '2023-03-20T09:00:00Z',
    phone: '081811223344',
    activationExpiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
    bankDetails: { bankName: 'BTPN', accountHolderName: 'Oleh-Oleh Khas', accountNumber: '9988776655' },
    profile: { name: 'Oleh-Oleh Khas Nusantara', shopName: 'Oleh-Oleh Khas Nusantara', profilePicture: 'https://i.pravatar.cc/150?u=local-business-1' },
  },
];

let mockApplications: PartnerApplication[] = [
  { id: 'app-1', name: 'Eka Wijaya', email: 'eka.w@example.com', phone: '081122334455', status: 'pending', submittedAt: new Date().toISOString(), partnerType: PartnerType.BikeDriver, documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Motorcycle', brand: 'Yamaha', model: 'NMAX', year: 2022, licensePlate: 'B 5555 JKL' } },
  { id: 'app-2', name: 'Rina Lestari', email: 'rina.l@example.com', phone: '082233445566', status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString(), partnerType: PartnerType.FoodVendor, documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  { id: 'app-3', name: 'Agus Salim', email: 'agus.s@example.com', phone: '083344556677', status: 'pending', submittedAt: new Date(Date.now() - 172800000).toISOString(), partnerType: PartnerType.CarDriver, documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Car', brand: 'Daihatsu', model: 'Xenia', year: 2019, licensePlate: 'F 9876 GHI' } },
];

let mockPartners: Partner[] = mockUsers.filter(u => u.role !== Role.Admin && u.role !== Role.Agent) as Partner[];

let mockTransactions: Transaction[] = [
    { id: 'tx-1', partnerId: 'driver-1', date: new Date(Date.now() - 100000).toISOString(), type: 'Ride', amount: 15000, status: 'completed', details: 'Kuningan to Sudirman', breakdown: { baseFare: 18750, platformFee: -3750, tip: 0, bonus: 0 } },
    { id: 'tx-2', partnerId: 'vendor-1', date: new Date(Date.now() - 200000).toISOString(), type: 'Order', amount: 45000, status: 'completed', details: 'Nasi Goreng x2, Es Teh x2' },
    { id: 'tx-3', partnerId: 'driver-2', date: new Date(Date.now() - 300000).toISOString(), type: 'Ride', amount: 42000, status: 'completed', details: 'Blok M to Kelapa Gading', breakdown: { baseFare: 50000, tip: 2500, platformFee: -10500, bonus: 0 } },
    { id: 'tx-4', partnerId: 'driver-1', date: new Date(Date.now() - 86400000).toISOString(), type: 'Delivery', amount: 12000, status: 'completed', details: 'Document from Thamrin to SCBD', breakdown: { baseFare: 15000, platformFee: -3000, tip: 0, bonus: 0 } },
    { id: 'tx-5', partnerId: 'vendor-1', date: new Date(Date.now() - 172800000).toISOString(), type: 'Order', amount: 120000, status: 'completed', details: 'Catering Box A x 4' },
    { id: 'tx-6', partnerId: 'massage-therapist-1', date: new Date(Date.now() - 2 * 86400000).toISOString(), type: 'Wellness', amount: 220000, status: 'completed', details: '90-min Deep Tissue Massage' },
    { id: 'tx-7', partnerId: 'massage-place-1', date: new Date(Date.now() - 3 * 86400000).toISOString(), type: 'Wellness', amount: 450000, status: 'completed', details: '120-min Aromatherapy Session' },
    { id: 'tx-8', partnerId: 'hotel-1', date: new Date(Date.now() - 4 * 86400000).toISOString(), type: 'Booking', amount: 1700000, status: 'completed', details: 'Deluxe Queen Room x2 nights' },
    { id: 'tx-9', partnerId: 'villa-1', date: new Date(Date.now() - 5 * 86400000).toISOString(), type: 'Booking', amount: 6000000, status: 'completed', details: 'Entire Villa x1 night' },
    { id: 'live-order-1', partnerId: 'vendor-1', date: new Date().toISOString(), type: 'Order', amount: 30000, status: 'in_progress', details: 'Soto Ayam x1, Sate Ayam x1' },
    { id: 'live-order-2', partnerId: 'vendor-1', date: new Date(Date.now() - 60000).toISOString(), type: 'Order', amount: 25000, status: 'in_progress', details: 'Gado-gado x1' },
];

let mockVendorItems: VendorItem[] = [
    { 
        id: 'item-1', vendorId: 'vendor-1', name: 'Nasi Goreng Spesial', price: 25000, isAvailable: true, imageUrl: 'https://i.imgur.com/n1Y4Nkf.png',
        description: 'Classic Indonesian fried rice.',
        longDescription: "A quintessential Indonesian dish, Nasi Goreng is stir-fried rice with a sweet and savory kecap manis sauce, vegetables, and your choice of protein. Our 'Spesial' version comes with a fried egg, chicken satay, and prawn crackers.",
        category: "Rice and Noodle Dishes",
        chiliLevel: 2,
        cookingTime: 15,
    },
    { 
        id: 'item-2', vendorId: 'vendor-1', name: 'Soto Ayam Lamongan', price: 20000, isAvailable: true, imageUrl: 'https://i.imgur.com/JLXmg37.png',
        description: 'Flavorful chicken noodle soup.',
        longDescription: 'A traditional Indonesian chicken soup infused with turmeric and a blend of aromatic spices. Served with rice noodles, shredded chicken, boiled egg, and celery. A comforting and hearty meal.',
        category: 'Soups and Curries',
        chiliLevel: 0,
        cookingTime: 20,
    },
    { 
        id: 'item-3', vendorId: 'vendor-1', name: 'Sate Ayam (10 tusuk)', price: 30000, isAvailable: false, imageUrl: 'https://i.imgur.com/e3sE3j8.png',
        description: 'Grilled chicken skewers with peanut sauce.',
        longDescription: 'Tender chicken skewers marinated in a sweet soy sauce and grilled over charcoal. Served with a rich and creamy peanut sauce, lontong (rice cakes), and sliced shallots.',
        category: 'Grilled and Skewered',
        chiliLevel: 1,
        cookingTime: 15,
    },
];

const mockRideRequests: RideRequest[] = [
    { id: 'req-1', pickupLocation: 'Grand Indonesia', destination: 'Stasiun Sudirman', fare: 12000, customerName: 'Dewi', customerRating: 4.8 },
];

let mockMessages: AdminMessage[] = [
    { id: 'msg-1', senderId: 'admin-1', recipientId: 'all', content: 'Selamat Hari Raya! Ada bonus spesial untuk semua partner aktif bulan ini.', sentAt: new Date(Date.now() - 86400000 * 2).toISOString(), readBy: ['driver-1'] },
    { id: 'msg-2', senderId: 'admin-1', recipientId: 'driver-2', content: 'Mohon perbarui dokumen STNK Anda sebelum akhir bulan.', sentAt: new Date().toISOString(), readBy: [] },
];

let mockTourDestinations: TourDestination[] = [
    { id: 'tour-1', name: 'Taman Mini Indonesia Indah', category: 'Culture & Art', description: 'A miniature park showcasing Indonesian culture.' },
    { id: 'tour-2', name: 'Ragunan Zoo', category: 'Nature & Outdoors', description: 'The largest zoo in Jakarta.' },
    { id: 'tour-3', name: 'Monas (National Monument)', category: 'Temples & Historical Sites', description: 'The iconic monument in the center of Merdeka Square.' },
    { id: 'tour-merapi', name: 'Mount Merapi Jeep Tour', category: 'Nature & Outdoors', description: 'An adventurous off-road tour on the slopes of an active volcano.' },
];

let mockContentOverrides: ContentOverrides = { 
    text: {
        'renewal-payment-instructions': 'Please transfer to the following account and upload your receipt.',
        'renewal-bank-name': 'BCA (Bank Central Asia)',
        'renewal-account-number': '123-456-7890',
        'renewal-account-holder': 'PT IndoStreet Jaya',
    }, 
    numbers: {}, 
    assets: {} 
};

// Populate new dynamic prices
const defaultPrices: Record<string, { '3': number, '6': number, '12': number }> = {
    [PartnerType.BikeDriver]: { '3': 150000, '6': 280000, '12': 500000 },
    [PartnerType.CarDriver]: { '3': 200000, '6': 380000, '12': 700000 },
    [PartnerType.LorryDriver]: { '3': 250000, '6': 480000, '12': 900000 },
    [PartnerType.FoodVendor]: { '3': 120000, '6': 220000, '12': 400000 },
    [PartnerType.StreetShop]: { '3': 100000, '6': 180000, '12': 320000 },
    [PartnerType.CarRental]: { '3': 300000, '6': 580000, '12': 1100000 },
    [PartnerType.BikeRental]: { '3': 220000, '6': 420000, '12': 800000 },
    [PartnerType.LocalBusiness]: { '3': 180000, '6': 340000, '12': 650000 },
    [PartnerType.MassageTherapist]: { '3': 130000, '6': 240000, '12': 420000 },
    [PartnerType.MassagePlace]: { '3': 220000, '6': 400000, '12': 750000 },
    [PartnerType.Hotel]: { '3': 500000, '6': 950000, '12': 1800000 },
    [PartnerType.Villa]: { '3': 600000, '6': 1100000, '12': 2000000 },
    [PartnerType.JeepTourOperator]: { '3': 250000, '6': 480000, '12': 900000 },
};

Object.values(PartnerType).forEach(type => {
    const slug = slugifyPartnerType(type as PartnerType);
    if(defaultPrices[type]) {
      mockContentOverrides.numbers[`membership-price-${slug}-3mo`] = defaultPrices[type]['3'];
      mockContentOverrides.numbers[`membership-price-${slug}-6mo`] = defaultPrices[type]['6'];
      mockContentOverrides.numbers[`membership-price-${slug}-12mo`] = defaultPrices[type]['12'];
    }
});


let mockRenewalSubmissions: RenewalSubmission[] = [
    {
        id: 'renewal-1',
        partnerId: 'driver-2', // Citra Dewi
        partnerName: 'Citra Dewi',
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
        selectedPackage: 6,
        amountPaid: defaultPrices[PartnerType.CarDriver]['6'],
        transactionNumber: 'INV/2024/07/12345',
        paymentMethod: 'Bank Transfer',
        receiptImage: 'iVBORw0KGgoAAAANSUhEUgAAAPoAAAC+CAYAAAD/K0OdAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACVSURBVHhe7cEBDQAAAMKg909tDwcFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfg2V4gABG1s0JAAAAABJRU5ErkJggg==', // placeholder receipt image
        status: 'pending',
    }
];

let mockVehicles: Vehicle[] = [
    {
      id: "taxi_bike_1",
      type: VehicleType.Bike,
      serviceType: "ride",
      name: "Yamaha NMAX",
      driver: "Dewi",
      driverImage: "https://i.pravatar.cc/150?u=dewi",
      driverRating: 4.9,
      plate: "DK 2222 DDD",
      pricePerKm: 2500,
      pricePerKmParcel: 3500,
      pricePerDay: 250000,
      bankDetails: {
        bankName: "BNI",
        accountHolder: "Dewi",
        accountNumber: "3344556677"
      },
      isAvailable: true,
      modelCc: "155cc",
      color: "Matte Black",
      registrationYear: 2023,
      zone: Zone.Zone1,
      whatsapp: "6281234567895"
    },
    {
      id: "taxi_bike_2",
      type: VehicleType.Bike,
      serviceType: "ride",
      name: "Honda Vario",
      driver: "Agung",
      driverImage: "https://i.pravatar.cc/150?u=agung",
      driverRating: 4.7,
      plate: "B 1234 EFG",
      pricePerKm: 2800,
      pricePerKmParcel: 3800,
      pricePerDay: undefined,
      bankDetails: {
        bankName: "BCA",
        accountHolder: "Agung Perkasa",
        accountNumber: "9876543210"
      },
      isAvailable: false,
      modelCc: "150cc",
      color: "Red",
      registrationYear: 2022,
      zone: Zone.Zone2,
      whatsapp: "6287654321098"
    },
     {
      id: "taxi_bike_3",
      type: VehicleType.Bike,
      serviceType: "ride",
      name: "Suzuki Address",
      driver: "Putu",
      driverImage: "https://i.pravatar.cc/150?u=putu",
      driverRating: 4.8,
      plate: "L 5555 XYZ",
      pricePerKm: 2200,
      pricePerKmParcel: 2500,
      pricePerDay: 180000,
      bankDetails: {
        bankName: "Mandiri",
        accountHolder: "I Putu Gede",
        accountNumber: "1122334455"
      },
      isAvailable: true,
      modelCc: "113cc",
      color: "White",
      registrationYear: 2021,
      zone: Zone.Zone3,
      whatsapp: "628555666777"
    },
    {
      id: "jeep_1",
      partnerId: "jeep-driver-1",
      type: VehicleType.Jeep,
      serviceType: "tour",
      name: "Willys Jeep 'The Volcano'",
      driver: "I Wayan Koster",
      driverImage: "https://i.pravatar.cc/150?u=jeep-driver-1",
      driverRating: 4.9,
      plate: "DK 4321 JEEP",
      isAvailable: true,
      seats: 4,
      operatingHours: "5:00 AM - 5:00 PM",
      associatedDestinationID: 'tour-merapi',
      color: "Army Green",
      registrationYear: 1985,
      whatsapp: "6281234567891",
      bankDetails: {
        bankName: "BCA",
        accountHolder: "I Wayan Koster",
        accountNumber: "1111222233"
      },
      tourPackages: [
        { id: 'pkg-1', name: "Sunrise Tour", description: "Catch the stunning sunrise over the volcano.", price: 550000, duration: "3-4 Hours", includes: ["Driver", "Fuel", "Safety Gear"] },
        { id: 'pkg-2', name: "Short Lava Tour", description: "Visit key eruption sites and the Alien Stone.", price: 450000, duration: "2-3 Hours", includes: ["Driver", "Fuel", "Entry Tickets"] }
      ]
    }
];

let mockRooms: Room[] = [
    {
        id: 'room-1',
        vendorId: 'hotel-1',
        name: 'Deluxe Queen Room',
        pricePerNight: 850000,
        mainImage: 'https://via.placeholder.com/800x600/BEE3F8/2C5282?Text=Deluxe+Room',
        thumbnails: [
            'https://via.placeholder.com/400x300/BEE3F8/2C5282?Text=View',
            'https://via.placeholder.com/400x300/BEE3F8/2C5282?Text=Bed',
            'https://via.placeholder.com/400x300/BEE3F8/2C5282?Text=Bathroom',
        ],
        isAvailable: true,
        amenities: { balcony: true, seaView: false, kitchenette: false },
        specialOffer: { enabled: true, discountPercentage: 15 },
    },
    {
        id: 'room-2',
        vendorId: 'hotel-1',
        name: 'Suite with Private Pool',
        pricePerNight: 2100000,
        mainImage: 'https://via.placeholder.com/800x600/C4F1F9/086F83?Text=Suite',
        thumbnails: [
            'https://via.placeholder.com/400x300/C4F1F9/086F83?Text=Pool',
            'https://via.placeholder.com/400x300/C4F1F9/086F83?Text=Living+Area',
            'https://via.placeholder.com/400x300/C4F1F9/086F83?Text=Terrace',
        ],
        isAvailable: false,
        amenities: { balcony: true, privatePool: true, kitchenette: true },
        specialOffer: { enabled: false, discountPercentage: 0 },
    },
    {
        id: 'room-3',
        vendorId: 'villa-1',
        name: 'Entire 3-Bedroom Villa',
        pricePerNight: 6000000,
        mainImage: 'https://via.placeholder.com/800x600/D1D5DB/1F2937?Text=Villa+Exterior',
        thumbnails: [
            'https://via.placeholder.com/400x300/D1D5DB/1F2937?Text=Pool+Night',
            'https://via.placeholder.com/400x300/D1D5DB/1F2937?Text=Dining+Area',
            'https://via.placeholder.com/400x300/D1D5DB/1F2937?Text=Ocean+View',
        ],
        isAvailable: true,
        amenities: { balcony: true, privatePool: true, kitchenette: true, seaView: true },
        specialOffer: { enabled: true, discountPercentage: 20 },
    },
];

let mockMembers: Member[] = [
  { id: 'member-1', whatsappNumber: '6281234567890', name: 'Alex Chandra', lastKnownLocation: 'Kuta, Bali', createdAt: '2023-05-10T10:00:00Z', status: 'active' },
  { id: 'member-2', whatsappNumber: '6287712345678', name: 'Bunga Citra', lastKnownLocation: 'Seminyak, Bali', createdAt: '2023-06-15T14:30:00Z', status: 'active' },
  { id: 'member-3', whatsappNumber: '6285598765432', name: 'Charlie Dharma', lastKnownLocation: 'Ubud, Bali', createdAt: '2023-07-01T09:15:00Z', status: 'suspended' },
  { id: 'member-4', whatsappNumber: '6289955554444', name: 'Dian Eka', lastKnownLocation: 'Canggu, Bali', createdAt: '2023-07-20T18:00:00Z', status: 'warned' },
];

let mockProspects: Prospect[] = [
  {
    id: 'prospect-1',
    agentId: 'agent-1',
    name: 'Warung Makan Sedap',
    email: 'warung.sedap@example.com',
    phone: '081299887766',
    address: 'Kuta',
    street: 'Jl. Legian No. 123',
    partnerType: PartnerType.FoodVendor,
    meetingNotes: 'Initial meeting went well. Interested in the 6-month package. Needs a follow-up call to discuss the onboarding process.',
    meetingDateTime: new Date().toISOString(),
    callbackDateTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'prospect',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prospect-2',
    agentId: 'agent-1',
    name: 'Putu Transport',
    email: 'putu.transport@example.com',
    phone: '085511223344',
    address: 'Seminyak',
    street: 'Jl. Kayu Aya No. 55',
    partnerType: PartnerType.CarDriver,
    meetingNotes: 'Agreed to join. Has all documents ready. Switched to active.',
    meetingDateTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending_approval',
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prospect-3',
    agentId: 'agent-1',
    name: 'Bali Healing Massage',
    email: 'healing.massage@example.com',
    phone: '087755667788',
    address: 'Ubud',
    street: 'Jl. Hanoman No. 9',
    partnerType: PartnerType.MassageTherapist,
    meetingNotes: 'Considering options. Call back next week.',
    meetingDateTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    callbackDateTime: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    status: 'prospect',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

let mockAgentApplications: AgentApplication[] = [
  {
    id: 'agent-app-1',
    name: 'Prabowo Subianto',
    email: 'prabowo.newagent@example.com',
    nik: '3201234567890001',
    age: 32,
    whatsapp: '6281234567890',
    address: 'Jl. Kertanegara No. 4, Jakarta',
    lastJob: 'Marketing at GoJek',
    transport: 'own',
    equipment: ['laptop', 'phone'],
    shirtSize: 'L',
    policeRecord: false,
    idCardImage: tinyBase64Image,
    profilePhotoImage: tinyBase64Image,
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

let mockMassageTypes: MassageType[] = [
    // Western Massages
    {
        id: 'mt-swedish',
        name: 'Swedish Massage',
        description: 'The most common type of massage, involving long, flowing strokes to relax the entire body. Ideal for first-timers and stress relief.',
        imageUrl: 'https://via.placeholder.com/400x300/BAE6FD/0C4A6E?Text=Swedish+Massage',
        category: MassageTypeCategory.Western,
    },
    {
        id: 'mt-deeptissue',
        name: 'Deep Tissue Massage',
        description: 'Uses more forceful strokes to target the deeper layers of muscle and connective tissue. Commonly used for chronic aches and pains.',
        imageUrl: 'https://via.placeholder.com/400x300/93C5FD/1E40AF?Text=Deep+Tissue',
        category: MassageTypeCategory.Western,
    },
    {
        id: 'mt-sports',
        name: 'Sports Massage',
        description: 'Designed for athletes, this massage focuses on areas of the body that are overused and stressed from repetitive and aggressive movements.',
        imageUrl: 'https://via.placeholder.com/400x300/6EE7B7/064E3B?Text=Sports+Massage',
        category: MassageTypeCategory.Western,
    },
    {
        id: 'mt-hotstone',
        name: 'Hot Stone Massage',
        description: 'Heated stones are placed on different areas of the body to ease muscle tension and pain. The heat helps to relax muscles.',
        imageUrl: 'https://via.placeholder.com/400x300/FDBA74/9A3412?Text=Hot+Stone',
        category: MassageTypeCategory.Western,
    },
    {
        id: 'mt-aromatherapy',
        name: 'Aromatherapy Massage',
        description: 'Combines soft, gentle pressure with the use of essential oils. The therapist decides which oils to use based on your needs.',
        imageUrl: 'https://via.placeholder.com/400x300/FBCFE8/9D2B6B?Text=Aromatherapy',
        category: MassageTypeCategory.Western,
    },
    {
        id: 'mt-prenatal',
        name: 'Prenatal Massage',
        description: 'A safe and gentle massage for pregnant women to help reduce stress, decrease swelling, and relieve aches and pains.',
        imageUrl: 'https://via.placeholder.com/400x300/DDD6FE/5B21B6?Text=Prenatal',
        category: MassageTypeCategory.Western,
    },

    // Eastern & Indonesian Massages
    {
        id: 'mt-balinese',
        name: 'Balinese Massage',
        description: 'A full-body, deep-tissue, holistic treatment using a combination of gentle stretches, acupressure, and aromatherapy to stimulate energy flow.',
        imageUrl: 'https://via.placeholder.com/400x300/A7F3D0/14532D?Text=Balinese+Massage',
        category: MassageTypeCategory.EasternIndonesian,
    },
    {
        id: 'mt-javanese',
        name: 'Javanese Massage',
        description: 'A strong, deep tissue massage that uses all parts of the hand, including the knuckles, to stimulate the muscles and improve circulation.',
        imageUrl: 'https://via.placeholder.com/400x300/FDE68A/92400E?Text=Javanese+Massage',
        category: MassageTypeCategory.EasternIndonesian,
    },
    {
        id: 'mt-thai',
        name: 'Thai Massage',
        description: 'An interactive massage where the therapist uses their hands, knees, legs, and feet to move you into a series of yoga-like stretches.',
        imageUrl: 'https://via.placeholder.com/400x300/A5B4FC/3730A3?Text=Thai+Massage',
        category: MassageTypeCategory.EasternIndonesian,
    },
    {
        id: 'mt-shiatsu',
        name: 'Shiatsu Massage',
        description: 'A Japanese form of massage that uses finger pressure in a rhythmic sequence on acupuncture meridians to improve energy flow.',
        imageUrl: 'https://via.placeholder.com/400x300/FDA4AF/9F1239?Text=Shiatsu',
        category: MassageTypeCategory.EasternIndonesian,
    },
    {
        id: 'mt-reflexology',
        name: 'Reflexology',
        description: 'Involves applying different amounts of pressure to the feet, hands, and ears. It’s based on a theory that these body parts are connected to certain organs.',
        imageUrl: 'https://via.placeholder.com/400x300/D9F99D/4D7C0F?Text=Reflexology',
        category: MassageTypeCategory.EasternIndonesian,
    },
    {
        id: 'mt-acupressure',
        name: 'Acupressure',
        description: 'An ancient healing art using the fingers to gradually press key healing points, which stimulate the body\'s natural self-curative abilities.',
        imageUrl: 'https://via.placeholder.com/400x300/C4B5FD/5B21B6?Text=Acupressure',
        category: MassageTypeCategory.EasternIndonesian,
    },

    // Traditional Indonesian Techniques
    {
        id: 'mt-kerokan',
        name: 'Kerokan (Coin Rub)',
        description: 'A traditional healing technique that uses a coin to scrape the skin, believed to relieve cold and muscle pain by releasing "wind" from the body.',
        imageUrl: 'https://via.placeholder.com/400x300/E5E7EB/4B5563?Text=Kerokan',
        category: MassageTypeCategory.TraditionalIndonesian,
    },
    {
        id: 'mt-jamu',
        name: 'Jamu Massage',
        description: 'A traditional massage that uses herbal remedies and ancient techniques passed down through generations to restore balance and well-being.',
        imageUrl: 'https://via.placeholder.com/400x300/BBF7D0/166534?Text=Jamu+Massage',
        category: MassageTypeCategory.TraditionalIndonesian,
    },

    // Specialty Massages
    {
        id: 'mt-lymphatic',
        name: 'Lymphatic Drainage Massage',
        description: 'A gentle massage that encourages the movement of lymph fluids around the body. It can help reduce swelling and improve health.',
        imageUrl: 'https://via.placeholder.com/400x300/BFDBFE/1E40AF?Text=Lymphatic',
        category: MassageTypeCategory.Specialty,
    },
    {
        id: 'mt-triggerpoint',
        name: 'Trigger Point Massage',
        description: 'Designed to alleviate the source of the pain through cycles of isolated pressure and release. The recipient actively participates through deep breathing.',
        imageUrl: 'https://via.placeholder.com/400x300/FECACA/991B1B?Text=Trigger+Point',
        category: MassageTypeCategory.Specialty,
    },
    {
        id: 'mt-myofascial',
        name: 'Myofascial Release',
        description: 'A therapy used for treating skeletal muscle immobility and pain by relaxing contracted muscles, improving blood and lymphatic circulation.',
        imageUrl: 'https://via.placeholder.com/400x300/FED7AA/9A3412?Text=Myofascial',
        category: MassageTypeCategory.Specialty,
    },
    {
        id: 'mt-cupping',
        name: 'Cupping Therapy',
        description: 'An ancient form of alternative medicine in which a therapist puts special cups on your skin for a few minutes to create suction.',
        imageUrl: 'https://via.placeholder.com/400x300/E9D5FF/6B21A8?Text=Cupping',
        category: MassageTypeCategory.Specialty,
    },
];

let mockFeedback: Feedback[] = [
    { id: 'fb-1', rating: 5, comment: 'Very friendly and safe driver!', date: new Date(Date.now() - 86400000).toISOString() },
    { id: 'fb-2', rating: 4, comment: 'Good trip, but the car could be cleaner.', date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: 'fb-3', rating: 5, comment: 'Fast and efficient. Great service.', date: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: 'fb-4', rating: 5, date: new Date(Date.now() - 4 * 86400000).toISOString() },
];

let mockPayouts: Payout[] = [
    { id: 'po-1', date: new Date(Date.now() - 7 * 86400000).toISOString(), amount: 1540000, status: 'completed', bankName: 'BCA', accountNumberLast4: '7890' },
    { id: 'po-2', date: new Date(Date.now() - 14 * 86400000).toISOString(), amount: 1380000, status: 'completed', bankName: 'BCA', accountNumberLast4: '7890' },
];


// Helper for simulating network delay
const mockApiCall = <T>(data: T, delay = 500): Promise<T> => {
    return new Promise(resolve => {
        setTimeout(() => {
            // Return a deep copy to prevent direct mutation of the mock database
            resolve(JSON.parse(JSON.stringify(data)));
        }, delay);
    });
};

// #endregion MOCK DATABASE


// In a real app, this would be in a .env file, not hardcoded.
const BASE_URL = '/api/v1'; // This is kept for when we switch to the real API.

/**
 * Retrieves the authentication token from session storage.
 */
const getToken = (): string | null => sessionStorage.getItem('authToken');

/**
 * A centralized fetch wrapper (currently unused by mock functions but kept for real implementation).
 */
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // ... (The original apiFetch implementation is kept here for the future)
};

// --- Authentication ---

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    console.log(`Attempting mock login for: ${email}`);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (password !== 'password') {
                return reject(new Error('Invalid credentials. (Hint: password is "password")'));
            }
            const user = mockUsers.find(u => u.email === email);
            if (!user) {
                return reject(new Error('User not found. Please use one of the demo accounts.'));
            }
            const token = `mock-token-for-${user.id}-${Date.now()}`;
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('user', JSON.stringify(user));
            console.log('Mock login successful for:', user.role);
            resolve({ user: JSON.parse(JSON.stringify(user)), token });
        }, 500);
    });
};


export const logout = (): void => {
  sessionStorage.removeItem('authToken');
  sessionStorage.removeItem('user');
};

export const checkSession = (): User | null => {
  const userJson = sessionStorage.getItem('user');
  const token = getToken();
  if (userJson && token) {
    try {
      return JSON.parse(userJson);
    } catch (e) {
      logout();
      return null;
    }
  }
  return null;
};


// --- Mock Admin API ---
export const getAdminStats = (): Promise<AdminStats> => mockApiCall({
    totalPartners: mockPartners.length,
    pendingApplications: mockApplications.filter(a => a.status === 'pending').length,
    activeDrivers: mockPartners.filter(p => p.role === Role.Driver && p.status === 'active').length,
    activeVendorsAndBusinesses: mockPartners.filter(p => (p.role === Role.Vendor || p.role === Role.LodgingPartner) && p.status === 'active').length,
    pendingRenewals: mockRenewalSubmissions.filter(s => s.status === 'pending').length,
    pendingAgentSignups: mockProspects.filter(p => p.status === 'pending_approval').length,
    pendingAgentApplications: mockAgentApplications.filter(a => a.status === 'pending').length,
});
export const getApplications = (): Promise<PartnerApplication[]> => mockApiCall(mockApplications);
export const getPartners = (): Promise<Partner[]> => mockApiCall(mockPartners);
export const getAgents = (): Promise<User[]> => mockApiCall(mockUsers.filter(u => u.role === Role.Agent));
export const getAllProspects = (): Promise<Prospect[]> => mockApiCall(mockProspects);


export const updateApplication = (id: string, status: 'approved' | 'rejected'): Promise<PartnerApplication> => {
    const appIndex = mockApplications.findIndex(a => a.id === id);
    if (appIndex > -1) {
        mockApplications[appIndex].status = status;
        if (status === 'approved') {
          // You could add logic here to create a new partner from the application
        }
        return mockApiCall(mockApplications[appIndex], 200);
    }
    return Promise.reject(new Error("Application not found"));
};
export const getAnalyticsSummary = (): Promise<AnalyticsSummary> => mockApiCall({
    partnerGrowth: { total: mockPartners.length, change: 5.2 },
    rideAndOrderVolume: { total: mockTransactions.filter(t => t.status === 'completed').length, change: 12.5 },
    popularServices: [{ name: PartnerType.BikeDriver, count: 1200 }, { name: PartnerType.FoodVendor, count: 850 }, { name: PartnerType.CarDriver, count: 600 }],
    peakHours: [{ hour: '08:00', count: 300 }, { hour: '12:00', count: 500 }, { hour: '17:00', count: 700 }],
});
export const broadcastMessage = (content: string): Promise<AdminMessage> => {
    const newMessage: AdminMessage = { id: `msg-${Date.now()}`, senderId: 'admin-1', recipientId: 'all', content, sentAt: new Date().toISOString(), readBy: [] };
    mockMessages.push(newMessage);
    return mockApiCall(newMessage, 200);
};

// --- Mock Partners API ---
export const getPartner = (id: string): Promise<Partner> => {
    const partner = mockPartners.find(p => p.id === id);
    return partner ? mockApiCall(partner) : Promise.reject(new Error("Partner not found"));
};
export const updatePartner = (id: string, data: Partial<Partner>): Promise<Partner> => {
    const partnerIndex = mockPartners.findIndex(p => p.id === id);
    if (partnerIndex > -1) {
        const existingPartner = mockPartners[partnerIndex];
        // Deep merge for nested objects
        const updatedPartner = {
            ...existingPartner,
            ...data,
            profile: { ...existingPartner.profile, ...data.profile },
            bankDetails: { ...existingPartner.bankDetails, ...data.bankDetails },
            hotelVillaAmenities: { ...existingPartner.hotelVillaAmenities, ...data.hotelVillaAmenities },
        };
        mockPartners[partnerIndex] = updatedPartner;

        const userIndex = mockUsers.findIndex(u => u.id === id);
        if(userIndex > -1) {
          mockUsers[userIndex] = updatedPartner;
        }
        return mockApiCall(updatedPartner, 1000);
    }
    return Promise.reject(new Error("Partner not found"));
};


// --- Mock Transactions API ---
export const getTransactions = (): Promise<Transaction[]> => mockApiCall(mockTransactions);
export const getTransactionsForPartner = (partnerId: string): Promise<Transaction[]> => mockApiCall(mockTransactions.filter(t => t.partnerId === partnerId));
export const updateTransaction = (id: string, data: Partial<Transaction>): Promise<Transaction> => {
    const txIndex = mockTransactions.findIndex(t => t.id === id);
    if (txIndex > -1) {
        mockTransactions[txIndex] = { ...mockTransactions[txIndex], ...data };
        return mockApiCall(mockTransactions[txIndex], 200);
    }
    return Promise.reject(new Error("Transaction not found"));
};

// --- Mock Vendor Items API ---
export const getAllVendorItems = (): Promise<VendorItem[]> => mockApiCall(mockVendorItems);
export const getVendorItems = (vendorId: string): Promise<VendorItem[]> => mockApiCall(mockVendorItems.filter(i => i.vendorId === vendorId));
export const createVendorItem = (vendorId: string, data: Omit<VendorItem, 'id' | 'vendorId'>): Promise<VendorItem> => {
    const newItem: VendorItem = { ...data, id: `item-${Date.now()}`, vendorId };
    mockVendorItems.push(newItem);
    return mockApiCall(newItem, 200);
};
export const updateVendorItem = (itemId: string, data: Partial<VendorItem>): Promise<VendorItem> => {
    const itemIndex = mockVendorItems.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
        mockVendorItems[itemIndex] = { ...mockVendorItems[itemIndex], ...data };
        return mockApiCall(mockVendorItems[itemIndex], 200);
    }
    return Promise.reject(new Error("Item not found"));
};
export const deleteVendorItem = (itemId: string): Promise<void> => {
    mockVendorItems = mockVendorItems.filter(i => i.id !== itemId);
    return mockApiCall(undefined, 200);
};

// --- Mock Drivers API ---
export const getRideRequests = (): Promise<RideRequest[]> => mockApiCall(mockRideRequests);
export const getFeedbackForPartner = (partnerId: string): Promise<Feedback[]> => mockApiCall(mockFeedback);
export const getPayoutsForPartner = (partnerId: string): Promise<Payout[]> => mockApiCall(mockPayouts.map(p => ({...p, accountNumberLast4: (mockPartners.find(pa => pa.id === partnerId)?.bankDetails?.accountNumber || '0000').slice(-4)})));


// --- Mock Messages API ---
export const getMessages = (): Promise<AdminMessage[]> => mockApiCall(mockMessages);
export const getMessagesForPartner = (partnerId: string): Promise<AdminMessage[]> => mockApiCall(mockMessages.filter(m => m.recipientId === partnerId || m.recipientId === 'all'));
export const sendMessage = (recipientId: string, content: string): Promise<AdminMessage> => {
    const newMessage: AdminMessage = { id: `msg-${Date.now()}`, senderId: 'admin-1', recipientId, content, sentAt: new Date().toISOString(), readBy: [] };
    mockMessages.push(newMessage);
    return mockApiCall(newMessage, 200);
};
export const updateMessage = (messageId: string, data: Partial<AdminMessage>): Promise<AdminMessage> => {
     const msgIndex = mockMessages.findIndex(m => m.id === messageId);
    if (msgIndex > -1) {
        mockMessages[msgIndex] = { ...mockMessages[msgIndex], ...data };
        return mockApiCall(mockMessages[msgIndex], 200);
    }
    return Promise.reject(new Error("Message not found"));
};

// --- Mock Tours API ---
export const getTourDestinations = (): Promise<TourDestination[]> => mockApiCall(mockTourDestinations);
export const createTourDestination = (data: Omit<TourDestination, 'id'>): Promise<TourDestination> => {
    const newDest: TourDestination = { ...data, id: `tour-${Date.now()}` };
    mockTourDestinations.push(newDest);
    return mockApiCall(newDest, 200);
};
export const updateTourDestination = (id: string, data: Partial<TourDestination>): Promise<TourDestination> => {
    const destIndex = mockTourDestinations.findIndex(d => d.id === id);
    if (destIndex > -1) {
        mockTourDestinations[destIndex] = { ...mockTourDestinations[destIndex], ...data };
        return mockApiCall(mockTourDestinations[destIndex], 200);
    }
    return Promise.reject(new Error("Destination not found"));
};
export const deleteTourDestination = (id: string): Promise<void> => {
    // FIX: The filter condition was comparing a TourDestination object `d` with an `id` string. Corrected to compare `d.id` with `id`.
    mockTourDestinations = mockTourDestinations.filter(d => d.id !== id);
    return mockApiCall(undefined, 200);
};

// --- LIVE CMS API ---
export const getContentOverrides = (): Promise<ContentOverrides> => {
  return mockApiCall(mockContentOverrides);
};

export const updateContentOverrides = (newOverrides: ContentOverrides): Promise<ContentOverrides> => {
  mockContentOverrides = newOverrides;
  return mockApiCall(mockContentOverrides, 200);
};

// --- Membership Renewal API ---
export const getRenewalSubmissions = (): Promise<RenewalSubmission[]> => {
    return mockApiCall(mockRenewalSubmissions);
};
export const createRenewalSubmission = (data: Omit<RenewalSubmission, 'id' | 'submittedAt' | 'status'>): Promise<RenewalSubmission> => {
    const newSubmission: RenewalSubmission = {
        ...data,
        id: `renewal-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        status: 'pending',
    };
    mockRenewalSubmissions.push(newSubmission);
    return mockApiCall(newSubmission, 200);
};
export const updateRenewalSubmission = (id: string, data: Partial<RenewalSubmission>): Promise<RenewalSubmission> => {
    const subIndex = mockRenewalSubmissions.findIndex(s => s.id === id);
    if (subIndex > -1) {
        const originalSubmission = mockRenewalSubmissions[subIndex];
        const updatedSubmission = { ...originalSubmission, ...data };

        // If status is changed to 'approved', set the approval date
        if (data.status === 'approved' && originalSubmission.status !== 'approved') {
            updatedSubmission.approvedAt = new Date().toISOString();
        }

        mockRenewalSubmissions[subIndex] = updatedSubmission;
        return mockApiCall(mockRenewalSubmissions[subIndex], 200);
    }
    return Promise.reject(new Error("Renewal submission not found"));
};

// --- Mock Bike Fleet API ---
export const getVehicles = (): Promise<Vehicle[]> => mockApiCall(mockVehicles);

export const createVehicle = (data: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const newVehicle: Vehicle = { ...data, id: `taxi_bike_${Date.now()}` };
    mockVehicles.push(newVehicle);
    return mockApiCall(newVehicle, 200);
};

export const updateVehicle = (id: string, data: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle> => {
    const vehicleIndex = mockVehicles.findIndex(v => v.id === id);
    if (vehicleIndex > -1) {
        mockVehicles[vehicleIndex] = { ...mockVehicles[vehicleIndex], ...data };
        return mockApiCall(mockVehicles[vehicleIndex], 200);
    }
    return Promise.reject(new Error("Vehicle not found"));
};

export const deleteVehicle = (id: string): Promise<void> => {
    mockVehicles = mockVehicles.filter(v => v.id !== id);
    return mockApiCall(undefined, 200);
};

// --- Mock Lodging (Hotel/Villa) API ---
export const getRoomsForProperty = (vendorId: string): Promise<Room[]> => mockApiCall(mockRooms.filter(r => r.vendorId === vendorId));

export const createRoom = (vendorId: string, data: Omit<Room, 'id' | 'vendorId'>): Promise<Room> => {
    const newRoom: Room = { ...data, id: `room-${Date.now()}`, vendorId };
    mockRooms.push(newRoom);
    return mockApiCall(newRoom);
};

export const updateRoom = (roomId: string, data: Partial<Omit<Room, 'id'>>): Promise<Room> => {
    const roomIndex = mockRooms.findIndex(r => r.id === roomId);
    if (roomIndex > -1) {
        mockRooms[roomIndex] = { ...mockRooms[roomIndex], ...data };
        return mockApiCall(mockRooms[roomIndex]);
    }
    return Promise.reject(new Error("Room not found"));
};

export const deleteRoom = (roomId: string): Promise<void> => {
    mockRooms = mockRooms.filter(r => r.id !== roomId);
    return mockApiCall(undefined);
};

// --- Mock Member (End-User) API ---
export const getMembers = (): Promise<Member[]> => mockApiCall(mockMembers);

export const updateMember = (id: string, data: Partial<Member>): Promise<Member> => {
    const memberIndex = mockMembers.findIndex(m => m.id === id);
    if (memberIndex > -1) {
        mockMembers[memberIndex] = { ...mockMembers[memberIndex], ...data };
        return mockApiCall(mockMembers[memberIndex], 200);
    }
    return Promise.reject(new Error("Member not found"));
};

// --- Mock Agent API ---
export const getProspectsForAgent = (agentId: string): Promise<Prospect[]> => mockApiCall(mockProspects.filter(p => p.agentId === agentId));
export const getPartnersForAgent = (agentId: string): Promise<Partner[]> => mockApiCall(mockPartners.filter(p => p.agentId === agentId));


export const createProspect = (agentId: string, data: Omit<Prospect, 'id' | 'agentId' | 'createdAt' | 'status'>): Promise<Prospect> => {
    const newProspect: Prospect = { 
        ...data, 
        id: `prospect-${Date.now()}`, 
        agentId,
        createdAt: new Date().toISOString(),
        status: 'prospect'
    };
    mockProspects.push(newProspect);
    return mockApiCall(newProspect);
};

export const updateProspect = (id: string, data: Partial<Prospect>): Promise<Prospect> => {
    const prospectIndex = mockProspects.findIndex(p => p.id === id);
    if (prospectIndex > -1) {
        const originalProspect = mockProspects[prospectIndex];
        const updatedProspect = { ...originalProspect, ...data };
        
        // If status is changed to 'pending_approval', create an application for the admin
        if (data.status === 'pending_approval' && originalProspect.status === 'prospect') {
            const newApplication: PartnerApplication = {
                id: `app-${Date.now()}`,
                prospectId: id,
                name: updatedProspect.name,
                email: updatedProspect.email,
                phone: updatedProspect.phone,
                status: 'pending',
                submittedAt: new Date().toISOString(),
                partnerType: updatedProspect.partnerType,
                documents: { eKtp: '#', skck: '#' }, // Placeholder docs
            };
            mockApplications.push(newApplication);
            console.log('Created new application for admin from prospect:', newApplication.name);
        } else if (data.status === 'prospect' && originalProspect.status === 'pending_approval') {
            // If status is reverted, remove the application
            const appIndex = mockApplications.findIndex(app => app.prospectId === id);
            if (appIndex > -1) {
                mockApplications.splice(appIndex, 1);
                console.log('Removed application for prospect:', originalProspect.name);
            }
        }
        
        mockProspects[prospectIndex] = updatedProspect;
        return mockApiCall(updatedProspect, 200);
    }
    return Promise.reject(new Error("Prospect not found"));
};

// --- New Agent Signup API ---
export const getAgentApplications = (): Promise<AgentApplication[]> => mockApiCall(mockAgentApplications);

export const updateAgentApplicationStatus = (id: string, status: 'approved' | 'rejected'): Promise<AgentApplication> => {
  const appIndex = mockAgentApplications.findIndex(a => a.id === id);
  if (appIndex > -1) {
      mockAgentApplications[appIndex].status = status;
      if (status === 'approved') {
          const approvedApp = mockAgentApplications[appIndex];
          const newAgent: User = {
              id: `agent-${Date.now()}`,
              email: approvedApp.email,
              role: Role.Agent,
              profile: { 
                name: approvedApp.name, 
                profilePicture: approvedApp.profilePhotoImage || 'https://i.pravatar.cc/150?u=new-agent' 
              },
          };
          mockUsers.push(newAgent);
          console.log('New agent created:', newAgent.email);
      }
      return mockApiCall(mockAgentApplications[appIndex]);
  }
  return Promise.reject(new Error("Agent application not found"));
};

export const submitAgentApplication = (data: Omit<AgentApplication, 'id' | 'status' | 'submittedAt'>): Promise<AgentApplication> => {
    const newApp: AgentApplication = {
        ...data,
        id: `agent-app-${Date.now()}`,
        status: 'pending',
        submittedAt: new Date().toISOString(),
    };
    mockAgentApplications.push(newApp);
    return mockApiCall(newApp);
};

// --- Massage Directory API ---
export const getMassageTypes = (): Promise<MassageType[]> => mockApiCall(mockMassageTypes);

export const createMassageType = (data: Omit<MassageType, 'id'>): Promise<MassageType> => {
    const newType: MassageType = { ...data, id: `mt-${Date.now()}` };
    mockMassageTypes.push(newType);
    return mockApiCall(newType);
};

export const updateMassageType = (id: string, data: Partial<Omit<MassageType, 'id'>>): Promise<MassageType> => {
    const typeIndex = mockMassageTypes.findIndex(t => t.id === id);
    if (typeIndex > -1) {
        mockMassageTypes[typeIndex] = { ...mockMassageTypes[typeIndex], ...data };
        return mockApiCall(mockMassageTypes[typeIndex]);
    }
    return Promise.reject(new Error("Massage type not found"));
};

export const deleteMassageType = (id: string): Promise<void> => {
    mockMassageTypes = mockMassageTypes.filter(t => t.id !== id);
    return mockApiCall(undefined);
};