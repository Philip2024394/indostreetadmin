
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
} from '../types';

// #region MOCK DATABASE
// This section contains a complete in-memory mock database to allow the app
// to function without a real backend. When the backend is ready, this section
// and the mock implementations of the API functions can be removed.

// A simple base64 encoded 1x1 transparent png
const tinyBase64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

const slugifyPartnerType = (type: PartnerType): string => type.toLowerCase().replace(/\s+/g, '-');


const mockUsers: (User | Partner)[] = [
  {
    id: 'admin-1',
    email: 'admin@indostreet.com',
    role: Role.Admin,
    profile: { name: 'Admin IndoStreet', profilePicture: 'https://i.pravatar.cc/150?u=admin-1' },
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
  },
];

let mockApplications: PartnerApplication[] = [
  { id: 'app-1', name: 'Eka Wijaya', email: 'eka.w@example.com', phone: '081122334455', status: 'pending', submittedAt: new Date().toISOString(), partnerType: PartnerType.BikeDriver, documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Motorcycle', brand: 'Yamaha', model: 'NMAX', year: 2022, licensePlate: 'B 5555 JKL' } },
  { id: 'app-2', name: 'Rina Lestari', email: 'rina.l@example.com', phone: '082233445566', status: 'pending', submittedAt: new Date(Date.now() - 86400000).toISOString(), partnerType: PartnerType.FoodVendor, documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  { id: 'app-3', name: 'Agus Salim', email: 'agus.s@example.com', phone: '083344556677', status: 'pending', submittedAt: new Date(Date.now() - 172800000).toISOString(), partnerType: PartnerType.CarDriver, documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Car', brand: 'Daihatsu', model: 'Xenia', year: 2019, licensePlate: 'F 9876 GHI' } },
];

let mockPartners: Partner[] = mockUsers.filter(u => u.role !== Role.Admin) as Partner[];

let mockTransactions: Transaction[] = [
    { id: 'tx-1', partnerId: 'driver-1', date: new Date(Date.now() - 100000).toISOString(), type: 'Ride', amount: 15000, status: 'completed', details: 'Kuningan to Sudirman' },
    { id: 'tx-2', partnerId: 'vendor-1', date: new Date(Date.now() - 200000).toISOString(), type: 'Order', amount: 45000, status: 'completed', details: 'Nasi Goreng x2, Es Teh x2' },
    { id: 'tx-3', partnerId: 'driver-2', date: new Date(Date.now() - 300000).toISOString(), type: 'Ride', amount: 42000, status: 'completed', details: 'Blok M to Kelapa Gading' },
    { id: 'tx-4', partnerId: 'driver-1', date: new Date(Date.now() - 86400000).toISOString(), type: 'Delivery', amount: 12000, status: 'completed', details: 'Document from Thamrin to SCBD' },
    { id: 'tx-5', partnerId: 'vendor-1', date: new Date(Date.now() - 172800000).toISOString(), type: 'Order', amount: 120000, status: 'completed', details: 'Catering Box A x 4' },
    { id: 'live-order-1', partnerId: 'vendor-1', date: new Date().toISOString(), type: 'Order', amount: 30000, status: 'in_progress', details: 'Soto Ayam x1, Sate Ayam x1' },
    { id: 'live-order-2', partnerId: 'vendor-1', date: new Date(Date.now() - 60000).toISOString(), type: 'Order', amount: 25000, status: 'in_progress', details: 'Gado-gado x1' },
];

let mockVendorItems: VendorItem[] = [
    { id: 'item-1', vendorId: 'vendor-1', name: 'Nasi Goreng Spesial', price: 25000, isAvailable: true, imageUrl: 'https://via.placeholder.com/150/FFC107/000000?Text=Nasi+Goreng' },
    { id: 'item-2', vendorId: 'vendor-1', name: 'Soto Ayam Lamongan', price: 20000, isAvailable: true, imageUrl: 'https://via.placeholder.com/150/8BC34A/000000?Text=Soto+Ayam' },
    { id: 'item-3', vendorId: 'vendor-1', name: 'Sate Ayam (10 tusuk)', price: 30000, isAvailable: false, imageUrl: 'https://via.placeholder.com/150/E91E63/000000?Text=Sate+Ayam' },
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
const defaultPrices: Record<PartnerType, { '3': number, '6': number, '12': number }> = {
    [PartnerType.BikeDriver]: { '3': 150000, '6': 280000, '12': 500000 },
    [PartnerType.CarDriver]: { '3': 200000, '6': 380000, '12': 700000 },
    [PartnerType.LorryDriver]: { '3': 250000, '6': 480000, '12': 900000 },
    [PartnerType.FoodVendor]: { '3': 120000, '6': 220000, '12': 400000 },
    [PartnerType.StreetShop]: { '3': 100000, '6': 180000, '12': 320000 },
    [PartnerType.CarRental]: { '3': 300000, '6': 580000, '12': 1100000 },
    [PartnerType.BikeRental]: { '3': 220000, '6': 420000, '12': 800000 },
    [PartnerType.LocalBusiness]: { '3': 180000, '6': 340000, '12': 650000 },
};

Object.values(PartnerType).forEach(type => {
    const slug = slugifyPartnerType(type);
    mockContentOverrides.numbers[`membership-price-${slug}-3mo`] = defaultPrices[type]['3'];
    mockContentOverrides.numbers[`membership-price-${slug}-6mo`] = defaultPrices[type]['6'];
    mockContentOverrides.numbers[`membership-price-${slug}-12mo`] = defaultPrices[type]['12'];
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
      type: "Bike",
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
      type: "Bike",
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
      type: "Bike",
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
      whatsapp: "6285555666777"
    }
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
            resolve({ user, token });
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
    activeVendorsAndBusinesses: mockPartners.filter(p => p.role === Role.Vendor && p.status === 'active').length,
    pendingRenewals: mockRenewalSubmissions.filter(s => s.status === 'pending').length,
});
export const getApplications = (): Promise<PartnerApplication[]> => mockApiCall(mockApplications);
export const getPartners = (): Promise<Partner[]> => mockApiCall(mockPartners);
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
        mockPartners[partnerIndex] = { ...mockPartners[partnerIndex], ...data };
        // also update the main user list
        const userIndex = mockUsers.findIndex(u => u.id === id);
        if(userIndex > -1) {
          mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
        }
        return mockApiCall(mockPartners[partnerIndex], 200);
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
