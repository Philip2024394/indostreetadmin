import { Role, User, PartnerApplication, VendorItem, AdminStats, PartnerType, Partner, Transaction, AnalyticsSummary, RideRequest, AdminMessage, TourDestination } from '../types';

// MOCK DATA
const MOCK_USERS: User[] = [
  { id: 'admin-1', email: 'admin@indostreet.com', role: Role.Admin, profile: { name: 'Admin IndoStreet' } },
  { id: 'driver-1', email: 'driver@indostreet.com', role: Role.Driver, profile: { name: 'Budi Santoso', profilePicture: 'https://picsum.photos/seed/driver1/200', vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'Vario 150', year: 2022, licensePlate: 'B 1234 XYZ' } } },
  { id: 'driver-2', email: 'cardriver@indostreet.com', role: Role.Driver, profile: { name: 'Eko Prasetyo', profilePicture: 'https://picsum.photos/seed/driver2/200', vehicle: { type: 'Car', brand: 'Toyota', model: 'Avanza', year: 2022, licensePlate: 'D 5678 ABC' } } },
  { id: 'vendor-1', email: 'vendor@indostreet.com', role: Role.Vendor, profile: { name: 'Siti Aminah', shopName: 'Warung Nasi Goreng Bu Siti' } },
  { id: 'driver-4', email: 'lorrydriver@indostreet.com', role: Role.Driver, profile: { name: 'Joko Widodo', profilePicture: 'https://picsum.photos/seed/driver4/200', vehicle: { type: 'Lorry', brand: 'Mitsubishi', model: 'Fuso', year: 2020, licensePlate: 'L 9876 KLM' } } },
];

let MOCK_PARTNERS: Partner[] = [
    { id: 'driver-1', email: 'budi.s@indostreet.com', role: Role.Driver, profile: { name: 'Budi Santoso', profilePicture: 'https://picsum.photos/seed/driver1/200', vehicle: { type: 'Motorcycle', brand: 'Honda', model: 'Vario 150', year: 2022, licensePlate: 'B 1234 XYZ' } }, partnerType: PartnerType.BikeDriver, status: 'active', rating: 4.8, totalEarnings: 1250000, memberSince: '2023-01-15T09:00:00Z', phone: '081234567890', activationExpiry: '2025-01-15T09:00:00Z', rideRatePerKm: 2600, minFare: 8000, parcelRatePerKm: 2000, hourlyHireRate: 25000, dailyHireRate: 200000, tourRates: { 'borobudur': 150000, 'prambanan': 100000, 'merapi': 120000 }, bankDetails: { bankName: 'BCA', accountHolderName: 'Budi Santoso', accountNumber: '1234567890' }, rentalDetails: { isAvailableForRental: true, dailyRate: 120000, weeklyRate: 750000 } },
    { id: 'vendor-1', email: 'siti.a@indostreet.com', role: Role.Vendor, profile: { name: 'Siti Aminah', shopName: 'Warung Nasi Goreng Bu Siti', profilePicture: 'https://picsum.photos/seed/vendor1/200' }, partnerType: PartnerType.FoodVendor, status: 'active', rating: 4.9, totalEarnings: 3500000, memberSince: '2022-11-20T14:00:00Z', phone: '081234567891', activationExpiry: '2024-12-20T14:00:00Z', bankDetails: { bankName: 'Mandiri', accountHolderName: 'Siti Aminah', accountNumber: '0987654321' } },
    { id: 'driver-2', email: 'eko.p@indostreet.com', role: Role.Driver, profile: { name: 'Eko Prasetyo', profilePicture: 'https://picsum.photos/seed/driver2/200', vehicle: { type: 'Car', brand: 'Toyota', model: 'Avanza', year: 2022, licensePlate: 'D 5678 ABC' } }, partnerType: PartnerType.CarDriver, status: 'suspended', rating: 4.7, totalEarnings: 2100000, memberSince: '2023-03-10T11:00:00Z', phone: '081234567892', activationExpiry: '2024-09-10T11:00:00Z', rideRatePerKm: 3500, minFare: 15200, parcelRatePerKm: 3000, hourlyHireRate: 75000, dailyHireRate: 600000, tourRates: { 'borobudur': 300000, 'prambanan': 250000, 'merapi': 280000, 'malioboro': 150000 }, bankDetails: { bankName: 'BNI', accountHolderName: 'Eko Prasetyo', accountNumber: '1122334455' }, rentalDetails: { isAvailableForRental: false, dailyRate: 350000, weeklyRate: 2100000 } },
    { id: 'rental-1', email: 'sewa@cepat.com', role: Role.Vendor, profile: { name: 'Rental Cepat', shopName: 'Sewa Mobil Cepat', profilePicture: 'https://picsum.photos/seed/rental1/200' }, partnerType: PartnerType.CarRental, status: 'active', rating: 4.6, totalEarnings: 5200000, memberSince: '2023-05-01T08:00:00Z', phone: '081234567893' },
    { id: 'driver-3', email: 'agus.s@email.com', role: Role.Driver, profile: { name: 'Agus Setiawan' }, partnerType: PartnerType.BikeDriver, status: 'pending', rating: 0, totalEarnings: 0, memberSince: '2024-07-28T10:00:00Z', phone: '081234567894' },
    { id: 'driver-4', email: 'joko.w@indostreet.com', role: Role.Driver, profile: { name: 'Joko Widodo', profilePicture: 'https://picsum.photos/seed/driver4/200', vehicle: { type: 'Lorry', brand: 'Mitsubishi', model: 'Fuso', year: 2020, licensePlate: 'L 9876 KLM' } }, partnerType: PartnerType.LorryDriver, status: 'active', rating: 4.6, totalEarnings: 4500000, memberSince: '2023-08-20T11:00:00Z', phone: '081234567895', activationExpiry: '2025-08-20T11:00:00Z' },
]

let MOCK_MESSAGES: AdminMessage[] = [
    { id: 'msg-1', senderId: 'admin-1', recipientId: 'driver-1', content: 'Please update your vehicle registration photo. The current one is blurry.', sentAt: '2024-07-28T10:00:00Z', readBy: [] },
    { id: 'msg-2', senderId: 'admin-1', recipientId: 'all', content: 'Happy holidays to all our partners! Drive safe and thank you for your hard work.', sentAt: '2024-07-27T15:00:00Z', readBy: ['driver-2'] },
    { id: 'msg-3', senderId: 'admin-1', recipientId: 'vendor-1', content: 'There is a system-wide promotion for Nasi Goreng next week. Please ensure you have enough stock.', sentAt: '2024-07-29T11:00:00Z', readBy: ['vendor-1'] },
];

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
    { id: 'txn6', partnerId: 'vendor-1', date: '2024-07-28T13:15:00Z', type: 'Order', amount: 22000, status: 'completed', details: 'Mie Goreng x1' },
    { id: 'txn7', partnerId: 'driver-1', date: '2024-07-28T14:00:00Z', type: 'Ride', amount: 18000, status: 'cancelled', details: 'Blok M to Senayan' },
    { id: 'txn8', partnerId: 'driver-2', date: '2024-07-27T18:00:00Z', type: 'Ride', amount: 55000, status: 'completed', details: 'City Tour' },
    { id: 'txn9', partnerId: 'driver-1', date: '2024-07-26T08:00:00Z', type: 'Ride', amount: 12000, status: 'completed', details: 'Kuningan to Tebet' },
    { id: 'txn10', partnerId: 'driver-4', date: '2024-07-28T09:00:00Z', type: 'Delivery', amount: 250000, status: 'completed', details: 'Furniture transport' },
    { id: 'txn11', partnerId: 'driver-4', date: '2024-07-27T14:30:00Z', type: 'Delivery', amount: 180000, status: 'in_progress', details: 'Moving boxes' },
    { id: 'txn12', partnerId: 'vendor-1', date: new Date(Date.now() - 60000).toISOString(), type: 'Order', amount: 72000, status: 'in_progress', details: 'Nasi Goreng Spesial x2, Kwetiau Siram x1' },
    { id: 'txn13', partnerId: 'vendor-1', date: new Date(Date.now() - 120000).toISOString(), type: 'Order', amount: 27000, status: 'in_progress', details: 'Mie Goreng Ayam x1, Es Teh Manis x1' },
];

const MOCK_RIDE_REQUESTS: RideRequest[] = [
    { id: 'ride1', pickupLocation: 'Grand Indonesia', destination: 'Stasiun Sudirman', fare: 12000, customerName: 'Rina', customerRating: 4.8 },
    { id: 'ride2', pickupLocation: 'Blok M Plaza', destination: 'Senayan City', fare: 15000, customerName: 'Joko', customerRating: 4.9 },
    { id: 'ride3', pickupLocation: 'Kota Kasablanka', destination: 'Kuningan City', fare: 10000, customerName: 'Sari', customerRating: 4.7 },
    { id: 'ride4', pickupLocation: 'Pacific Place', destination: 'Gelora Bung Karno', fare: 18000, customerName: 'Putra', customerRating: 5.0 },
    { id: 'ride5', pickupLocation: 'Bandara Soekarno-Hatta', destination: 'Menteng', fare: 85000, customerName: 'David', customerRating: 4.8 },
];

const MOCK_TOUR_DESTINATIONS: TourDestination[] = [
    // Temples & Historical Sites
    { id: 'borobudur', name: 'Borobudur Temple', category: 'Temples & Historical Sites', description: "World's largest Buddhist temple." },
    { id: 'prambanan', name: 'Prambanan Temple', category: 'Temples & Historical Sites', description: "Magnificent 9th-century Hindu temple." },
    { id: 'ratu_boko', name: 'Ratu Boko Palace', category: 'Temples & Historical Sites', description: "Archaeological site with stunning sunset views." },
    { id: 'sewu', name: 'Sewu Temple', category: 'Temples & Historical Sites', description: "Significant Buddhist temple near Prambanan." },
    { id: 'plaosan', name: 'Plaosan Temple', category: 'Temples & Historical Sites', description: "Unique blend of Hindu and Buddhist architecture." },
    { id: 'taman_sari', name: 'Taman Sari (Water Castle)', category: 'Temples & Historical Sites', description: "Former royal garden and bathing complex." },
    { id: 'keraton', name: 'Keraton Yogyakarta', category: 'Temples & Historical Sites', description: "Official residence of the Sultan." },
    // Nature & Outdoors
    { id: 'merapi', name: 'Mount Merapi', category: 'Nature & Outdoors', description: "Legendary active volcano for jeep tours." },
    { id: 'jomblang', name: 'Jomblang Cave', category: 'Nature & Outdoors', description: 'Famous for its "heavenly light" view.' },
    { id: 'gunung_kidul', name: 'Gunung Kidul Beaches', category: 'Nature & Outdoors', description: "Region known for beautiful beaches." },
    { id: 'timang', name: 'Timang Beach', category: 'Nature & Outdoors', description: "Famous for its adventurous cliff swing." },
    { id: 'tebing_breksi', name: 'Tebing Breksi', category: 'Nature & Outdoors', description: "Unique cliff formation with stunning views." },
    { id: 'mangunan', name: 'Mangunan Pines Forest', category: 'Nature & Outdoors', description: "Popular spot for nature and scenic views." },
    // Culture & Art
    { id: 'malioboro', name: 'Jalan Malioboro', category: 'Culture & Art', description: "Famous street for shopping and street food." },
    { id: 'ramayana', name: 'Ramayana Ballet', category: 'Culture & Art', description: "Spectacular performance at Prambanan." },
    { id: 'sonobudoyo', name: 'Sonobudoyo Museum', category: 'Culture & Art', description: "Houses historical artifacts and Javanese artworks." },
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
            const partner = MOCK_PARTNERS.find(p => p.id === user.id);
            if (partner) {
                user.partnerType = partner.partnerType;
            }
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
               else if (tableName === 'ride_requests') {
                // Return a random request to simulate a stream
                const randomIndex = Math.floor(Math.random() * MOCK_RIDE_REQUESTS.length);
                resolve({ data: [MOCK_RIDE_REQUESTS[randomIndex]], error: null });
              }
               else if (tableName === 'admin_messages') {
                resolve({ data: MOCK_MESSAGES, error: null });
              }
              else if (tableName === 'tour_destinations') {
                resolve({ data: MOCK_TOUR_DESTINATIONS, error: null });
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
                } else if (tableName === 'partners' && column === 'id') {
                    const partnerIndex = MOCK_PARTNERS.findIndex(p => p.id === value);
                    if (partnerIndex !== -1) {
                        MOCK_PARTNERS[partnerIndex] = { ...MOCK_PARTNERS[partnerIndex], ...updates };
                        resolve({ data: [MOCK_PARTNERS[partnerIndex]], error: null });
                    } else {
                        resolve({ data: null, error: new Error('Partner not found') });
                    }
                } else if (tableName === 'admin_messages' && column === 'id') {
                    const msgIndex = MOCK_MESSAGES.findIndex(m => m.id === value);
                    if (msgIndex !== -1) {
                        MOCK_MESSAGES[msgIndex] = { ...MOCK_MESSAGES[msgIndex], ...updates };
                        resolve({ data: [MOCK_MESSAGES[msgIndex]], error: null });
                    } else {
                        resolve({ data: null, error: new Error('Message not found') });
                    }
                } else if (tableName === 'transactions' && column === 'id') {
                    const txIndex = MOCK_TRANSACTIONS.findIndex(tx => tx.id === value);
                    if (txIndex !== -1) {
                        MOCK_TRANSACTIONS[txIndex] = { ...MOCK_TRANSACTIONS[txIndex], ...updates };
                        resolve({ data: [MOCK_TRANSACTIONS[txIndex]], error: null });
                    } else {
                        resolve({ data: null, error: new Error('Transaction not found') });
                    }
                }
                else {
                  resolve({ data: null, error: new Error('Update failed') });
                }
              }, 500);
            });
          }
        };
      },
      insert: (newData: any | any[]) => {
        return new Promise<{ data: any[] | null; error: Error | null }>((resolve) => {
           setTimeout(() => {
               if (tableName === 'admin_messages') {
                   const dataArray = Array.isArray(newData) ? newData : [newData];
                   const inserted = dataArray.map(d => ({
                       ...d,
                       id: `msg-${Date.now()}`,
                       sentAt: new Date().toISOString(),
                       readBy: [],
                       senderId: 'admin-1',
                   }));
                   MOCK_MESSAGES.push(...inserted);
                   resolve({ data: inserted, error: null });
               } else if (tableName === 'vendor_items') {
                   const dataArray = Array.isArray(newData) ? newData : [newData];
                   const inserted = dataArray.map(d => ({
                       ...d,
                       id: `item-${Date.now()}-${Math.random()}`,
                   }));
                   MOCK_ITEMS.push(...inserted);
                   resolve({ data: inserted, error: null });
               } else {
                   resolve({ data: null, error: new Error('Insert failed') });
               }
           }, 300);
        });
      },
      delete: () => {
        return {
          eq: (column: string, value: any) => {
            return new Promise<{ data: any[] | null; error: Error | null }>((resolve) => {
              setTimeout(() => {
                if (tableName === 'vendor_items' && column === 'id') {
                  const initialLength = MOCK_ITEMS.length;
                  MOCK_ITEMS = MOCK_ITEMS.filter(item => item.id !== value);
                  if (MOCK_ITEMS.length < initialLength) {
                    resolve({ data: [{ id: value }], error: null }); // Mimic Supabase returning the deleted row
                  } else {
                    resolve({ data: null, error: new Error('Item not found for deletion') });
                  }
                } else {
                  resolve({ data: null, error: new Error(`Delete failed for table ${tableName}`) });
                }
              }, 300);
            });
          }
        }
      },
    };
  }
};


export const supabase = mockSupabaseClient;
export { MOCK_USERS, MOCK_PARTNERS };