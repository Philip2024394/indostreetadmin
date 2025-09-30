
import { Role, User, PartnerApplication, VendorItem, AdminStats, PartnerType, Partner, Transaction, AnalyticsSummary } from '../types';

// MOCK DATA
const MOCK_USERS: User[] = [
  { id: 'admin-1', email: 'admin@indostreet.com', role: Role.Admin, profile: { name: 'Admin IndoStreet' } },
  { id: 'driver-1', email: 'driver@indostreet.com', role: Role.Driver, profile: { name: 'Budi Santoso', profilePicture: 'https://picsum.photos/seed/driver1/200', vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'Vario 150', year: 2022, licensePlate: 'B 1234 XYZ' } } },
  { id: 'vendor-1', email: 'vendor@indostreet.com', role: Role.Vendor, profile: { name: 'Siti Aminah', shopName: 'Warung Nasi Goreng Bu Siti' } },
];

let MOCK_PARTNERS: Partner[] = [
    { id: 'driver-1', email: 'budi.s@indostreet.com', role: Role.Driver, profile: { name: 'Budi Santoso', profilePicture: 'https://picsum.photos/seed/driver1/200', vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'Vario 150', year: 2022, licensePlate: 'B 1234 XYZ' } }, partnerType: PartnerType.BikeDriver, status: 'active', rating: 4.8, totalEarnings: 1250000, memberSince: '2023-01-15T09:00:00Z', phone: '081234567890' },
    { id: 'vendor-1', email: 'siti.a@indostreet.com', role: Role.Vendor, profile: { name: 'Siti Aminah', shopName: 'Warung Nasi Goreng Bu Siti', profilePicture: 'https://picsum.photos/seed/vendor1/200' }, partnerType: PartnerType.FoodVendor, status: 'active', rating: 4.9, totalEarnings: 3500000, memberSince: '2022-11-20T14:00:00Z', phone: '081234567891' },
    { id: 'driver-2', email: 'eko.p@indostreet.com', role: Role.Driver, profile: { name: 'Eko Prasetyo', profilePicture: 'https://picsum.photos/seed/driver2/200', vehicle: { type: 'Car', brand: 'Toyota', model: 'Avanza', year: 2022, licensePlate: 'D 5678 ABC' } }, partnerType: PartnerType.CarDriver, status: 'active', rating: 4.7, totalEarnings: 2100000, memberSince: '2023-03-10T11:00:00Z', phone: '081234567892' },
    { id: 'rental-1', email: 'sewa@cepat.com', role: Role.Vendor, profile: { name: 'Rental Cepat', shopName: 'Sewa Mobil Cepat', profilePicture: 'https://picsum.photos/seed/rental1/200' }, partnerType: PartnerType.CarRental, status: 'active', rating: 4.6, totalEarnings: 5200000, memberSince: '2023-05-01T08:00:00Z', phone: '081234567893' },
    { id: 'driver-3', email: 'agus.s@email.com', role: Role.Driver, profile: { name: 'Agus Setiawan' }, partnerType: PartnerType.BikeDriver, status: 'pending', rating: 0, totalEarnings: 0, memberSince: '2024-07-28T10:00:00Z', phone: '081234567894' },
]


let MOCK_PARTNER_APPLICATIONS: PartnerApplication[] = [
  // Bike Drivers
  { id: 'app1', name: 'Agus Setiawan', email: 'agus.s@email.com', phone: '081234567890', status: 'pending', partnerType: PartnerType.BikeDriver, submittedAt: '2024-07-28T10:00:00Z', documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Motorcycle', brand: 'Yamaha', model: 'NMAX', year: 2021, licensePlate: 'D 5678 ABC' } },
  { id: 'app2', name: 'Dewi Lestari', email: 'dewi.l@email.com', phone: '081234567891', status: 'pending', partnerType: PartnerType.BikeDriver, submittedAt: '2024-07-27T15:30:00Z', documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Motorcycle', brand: 'Suzuki', model: 'Address', year: 2023, licensePlate: 'F 9012 DEF' } },
  // Car Drivers
  { id: 'app3', name: 'Eko Prasetyo', email: 'eko.p@email.com', phone: '081234567892', status: 'pending', partnerType: PartnerType.CarDriver, submittedAt: '2024-07-26T09:00:00Z', documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Car', brand: 'Toyota', model: 'Avanza', year: 2022, licensePlate: 'B 3456 GHI' } },
  // Food Vendors
  { id: 'app4', name: 'Warung Makan Sedap', email: 'info@sedap.com', phone: '081234567893', status: 'pending', partnerType: PartnerType.FoodVendor, submittedAt: '2024-07-25T11:00:00Z', documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  // Street Shops
  { id: 'app5', name: 'Toko Kelontong Pak Jaya', email: 'jaya@email.com', phone: '081234567894', status: 'pending', partnerType: PartnerType.StreetShop, submittedAt: '2024-07-24T14:20:00Z', documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  // Car Rentals
  { id: 'app6', name: 'Sewa Mobil Cepat', email: 'rental@cepat.com', phone: '081234567895', status: 'pending', partnerType: PartnerType.CarRental, submittedAt: '2024-07-23T18:00:00Z', documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  // Bike Rentals
  { id: 'app7', name: 'Rental Motor Kilat', email: 'cs@kilatmotor.com', phone: '081234567896', status: 'pending', partnerType: PartnerType.BikeRental, submittedAt: '2024-07-22T09:45:00Z', documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  // Local Business
  { id: 'app8', name: 'Laundry Bersih Wangi', email: 'laundry@bersih.com', phone: '081234567897', status: 'pending', partnerType: PartnerType.LocalBusiness, submittedAt: '2024-07-21T12:00:00Z', documents: { eKtp: '#', skck: '#', businessLicense: '#' } },
  // Approved application for testing
  { id: 'app9', name: 'Rina Hartati', email: 'rina.h@email.com', phone: '081234567899', status: 'approved', partnerType: PartnerType.BikeDriver, submittedAt: '2024-07-20T09:00:00Z', documents: { eKtp: '#', sim: '#', stnk: '#', skck: '#' }, vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'PCX', year: 2022, licensePlate: 'B 3456 GHI' } },
];

let MOCK_ITEMS: VendorItem[] = [
  { id: 'item1', vendorId: 'vendor-1', name: 'Nasi Goreng Spesial', price: 25000, isAvailable: true, imageUrl: 'https://picsum.photos/seed/nasigoreng/400' },
  { id: 'item2', vendorId: 'vendor-1', name: 'Mie Goreng Ayam', price: 22000, isAvailable: true, imageUrl: 'https://picsum.photos/seed/miegoreng/400' },
  { id: 'item3', vendorId: 'vendor-1', name: 'Kwetiau Siram', price: 27000, isAvailable: false, imageUrl: 'https://picsum.photos/seed/kwetiau/400' },
  { id: 'item4', vendorId: 'vendor-1', name: 'Es Teh Manis', price: 5000, isAvailable: true, imageUrl: 'https://picsum.photos/seed/esteh/400' },
];

let MOCK_TRANSACTIONS: Transaction[] = [
    { id: 'txn1', partnerId: 'driver-1', date: '2024-07-28T10:05:00Z', type: 'Ride', amount: 15000, status: 'completed', details: 'Sudirman to Thamrin' },
    { id: 'txn2', partnerId: 'driver-1', date: '2024-07-28T11:20:00Z', type: 'Delivery', amount: 25000, status: 'completed', details: 'Food delivery from McD' },
    { id: 'txn3', partnerId: 'vendor-1', date: '2024-07-28T12:30:00Z', type: 'Order', amount: 52000, status: 'completed', details: 'Nasi Goreng x2, Es Teh x1' },
    { id: 'txn4', partnerId: 'driver-2', date: '2024-07-28T13:00:00Z', type: 'Ride', amount: 75000, status: 'completed', details: 'Airport Transfer' },
    { id: 'txn5', partnerId: 'rental-1', date: '2024-07-27T10:00:00Z', type: 'Rental', amount: 350000, status: 'completed', details: 'Toyota Avanza - 1 day' },
    { id: 'txn6', partnerId: 'vendor-1', date: '2024-07-28T13:15:00Z', type: 'Order', amount: 22000, status: 'in_progress', details: 'Mie Goreng x1' },
    { id: 'txn7', partnerId: 'driver-1', date: '2024-07-28T14:00:00Z', type: 'Ride', amount: 18000, status: 'cancelled', details: 'Blok M to Senayan' },
];

const MOCK_ANALYTICS_SUMMARY: AnalyticsSummary = {
    partnerGrowth: { total: MOCK_PARTNERS.length, change: 15.5 },
    rideAndOrderVolume: { total: MOCK_TRANSACTIONS.filter(t => t.status === 'completed').length, change: 22.1 },
    popularServices: [
        { name: PartnerType.BikeDriver, count: 4500 },
        { name: PartnerType.FoodVendor, count: 2100 },
        { name: PartnerType.CarDriver, count: 1500 },
        { name: PartnerType.CarRental, count: 800 },
    ],
    peakHours: [
        { hour: '08:00 AM', count: 750 },
        { hour: '12:00 PM', count: 980 },
        { hour: '06:00 PM', count: 1200 },
    ]
};

// MOCK SUPABASE CLIENT
const mockSupabaseClient = {
  auth: {
    signIn: async ({ email, password }: {email: string, password?: string}) => {
      return new Promise<{ data: { user: User | null }; error: Error | null }>((resolve, reject) => {
        setTimeout(() => {
          const user = MOCK_USERS.find(u => u.email === email);
          if (user && password === 'password') { // Generic password for mock
            resolve({ data: { user }, error: null });
          } else {
            resolve({ data: { user: null }, error: new Error('Invalid login credentials') });
          }
        }, 500);
      });
    },
    signOut: async () => {
      return new Promise<{ error: Error | null }>(resolve => {
        setTimeout(() => {
          resolve({ error: null });
        }, 200);
      });
    },
  },
  from: (tableName: string) => {
    return {
      select: (columns = '*') => {
        return {
          eq: (column: string, value: any) => {
             return new Promise<{ data: any[] | null; error: Error | null }>((resolve) => {
                setTimeout(() => {
                    if(tableName === 'vendor_items' && column === 'vendorId'){
                        resolve({ data: MOCK_ITEMS.filter(item => item.vendorId === value), error: null });
                    } else if (tableName === 'transactions' && column === 'partnerId') {
                        resolve({ data: MOCK_TRANSACTIONS.filter(t => t.partnerId === value), error: null });
                    }
                    else {
                        resolve({ data: [], error: null });
                    }
                }, 300);
            });
          },
          // A simplified select without filters
          async then(resolve: (result: { data: any[] | null; error: Error | null }) => void) {
            setTimeout(() => {
              if (tableName === 'partner_applications') {
                resolve({ data: MOCK_PARTNER_APPLICATIONS, error: null });
              } else if (tableName === 'partners') {
                resolve({ data: MOCK_PARTNERS, error: null });
              }
              else if (tableName === 'admin_stats') {
                const stats: AdminStats = {
                    totalPartners: MOCK_PARTNERS.filter(p => p.status === 'active').length,
                    pendingApplications: MOCK_PARTNER_APPLICATIONS.filter(a => a.status === 'pending').length,
                    activeDrivers: MOCK_PARTNERS.filter(p => p.status === 'active' && p.role === Role.Driver).length,
                    activeVendorsAndBusinesses: MOCK_PARTNERS.filter(p => p.status === 'active' && p.role !== Role.Driver).length,
                };
                resolve({ data: [stats], error: null });
              }
               else if (tableName === 'transactions') {
                resolve({ data: MOCK_TRANSACTIONS, error: null });
              }
               else if (tableName === 'analytics_summary') {
                resolve({ data: [MOCK_ANALYTICS_SUMMARY], error: null });
              }
              else {
                resolve({ data: null, error: new Error(`Table ${tableName} not found`) });
              }
            }, 500);
          }
        };
      },
      update: (updates: any) => {
        return {
          eq: (column: string, value: any) => {
            return new Promise<{ data: any[] | null; error: Error | null }>((resolve) => {
              setTimeout(() => {
                if (tableName === 'partner_applications' && column === 'id') {
                  const appIndex = MOCK_PARTNER_APPLICATIONS.findIndex(app => app.id === value);
                  if (appIndex !== -1) {
                    MOCK_PARTNER_APPLICATIONS[appIndex] = { ...MOCK_PARTNER_APPLICATIONS[appIndex], ...updates };
                    resolve({ data: [MOCK_PARTNER_APPLICATIONS[appIndex]], error: null });
                  } else {
                    resolve({ data: null, error: new Error('Application not found') });
                  }
                } else if (tableName === 'vendor_items' && column === 'id') {
                  const itemIndex = MOCK_ITEMS.findIndex(item => item.id === value);
                  if (itemIndex !== -1) {
                    MOCK_ITEMS[itemIndex] = { ...MOCK_ITEMS[itemIndex], ...updates };
                    resolve({ data: [MOCK_ITEMS[itemIndex]], error: null });
                  } else {
                    resolve({ data: null, error: new Error('Item not found') });
                  }
                }
                else {
                  resolve({ data: null, error: new Error('Update failed') });
                }
              }, 500);
            });
          }
        };
      }
    };
  }
};


export const supabase = mockSupabaseClient;
export { MOCK_USERS, MOCK_PARTNERS };