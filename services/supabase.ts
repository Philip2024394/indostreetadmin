
import { createClient, SupabaseClient } from '@supabase/supabase-js';
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

const supabaseUrl = "https://ovfhgfzdlwgjtzsfsgzf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92ZmhnZnpkbHdnanR6c2ZzZ3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2Nzc4NTQsImV4cCI6MjA3NTI1Mzg1NH0.NWUYp9AkyzNiqC5oYUG59pOGzxJGvMbz8Bzu96e8qOI";

let supabase: SupabaseClient;
export let supabaseInitializationError: string | null = null;

if (!supabaseUrl || !supabaseKey) {
  supabaseInitializationError = "Supabase URL and Anon Key are required. Make sure to set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.";
  console.error(supabaseInitializationError);

  supabase = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: { message: supabaseInitializationError, name: 'ConfigError', status: 500 } }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: supabaseInitializationError, name: 'ConfigError', status: 500 } }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
        select: () => Promise.resolve({ data: [], error: { message: supabaseInitializationError } }),
        update: () => Promise.resolve({ data: null, error: { message: supabaseInitializationError } }),
    }),
  } as unknown as SupabaseClient;

} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };

// --- Mock Data for Authentication ---
const createMockPartner = (id: string, email: string, partnerType: PartnerType, role: Role, overrides: Partial<Partner> = {}): Partner => ({
    id, email, partnerType, role,
    status: 'active',
    rating: 4.5,
    totalEarnings: 1500000,
    memberSince: new Date().toISOString(),
    phone: '628123456789',
    activationExpiry: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    profile: {
      name: overrides.profile?.name || `${partnerType} User`,
      shopName: overrides.profile?.shopName,
      profilePicture: 'https://i.pravatar.cc/150?u=' + email,
    },
    ...overrides
});

const mockUsers: Record<string, User> = {
  'admin@indostreet.com': { id: 'uuid-admin', email: 'admin@indostreet.com', role: Role.Admin, profile: { name: 'Admin User' } },
  'agent@indostreet.com': { id: 'uuid-agent', email: 'agent@indostreet.com', role: Role.Agent, profile: { name: 'Agent Smith' } },
  'driver@indostreet.com': createMockPartner('uuid-driver-bike', 'driver@indostreet.com', PartnerType.BikeDriver, Role.Driver),
  'cardriver@indostreet.com': createMockPartner('uuid-driver-car', 'cardriver@indostreet.com', PartnerType.CarDriver, Role.Driver, {profile: {name: "Car Driver Budi"}}),
  'lorrydriver@indostreet.com': createMockPartner('uuid-driver-lorry', 'lorrydriver@indostreet.com', PartnerType.LorryDriver, Role.Driver),
  'jeep@indostreet.com': createMockPartner('uuid-driver-jeep', 'jeep@indostreet.com', PartnerType.JeepTourOperator, Role.Driver),
  'vendor@indostreet.com': createMockPartner('uuid-vendor-food', 'vendor@indostreet.com', PartnerType.FoodVendor, Role.Vendor, { profile: { shopName: "Soto Ayam Pak Man" } }),
  'shop@indostreet.com': createMockPartner('uuid-vendor-shop', 'shop@indostreet.com', PartnerType.StreetShop, Role.Vendor, { profile: { shopName: "Warung Modern" } }),
  'business@indostreet.com': createMockPartner('uuid-vendor-biz', 'business@indostreet.com', PartnerType.LocalBusiness, Role.Vendor, { profile: { shopName: "Bali Crafts" } }),
  'carrental@indostreet.com': createMockPartner('uuid-vendor-carrental', 'carrental@indostreet.com', PartnerType.CarRental, Role.Vendor, { profile: { shopName: "Bali Car Hire" } }),
  'bikerental@indostreet.com': createMockPartner('uuid-vendor-bikerental', 'bikerental@indostreet.com', PartnerType.BikeRental, Role.Vendor, { profile: { shopName: "Scooter Rentals" } }),
  'busrental@indostreet.com': createMockPartner('uuid-vendor-busrental', 'busrental@indostreet.com', PartnerType.BusRental, Role.Vendor, { profile: { shopName: "Island Bus Tours" } }),
  'therapist@indostreet.com': createMockPartner('uuid-vendor-therapist', 'therapist@indostreet.com', PartnerType.MassageTherapist, Role.Vendor, { profile: { name: "Ayu Wellness" } }),
  'spa@indostreet.com': createMockPartner('uuid-vendor-spa', 'spa@indostreet.com', PartnerType.MassagePlace, Role.Vendor, { profile: { shopName: "Ubud Zen Spa" } }),
  'hotel@indostreet.com': createMockPartner('uuid-lodging-hotel', 'hotel@indostreet.com', PartnerType.Hotel, Role.LodgingPartner, { profile: { name: "Grand Bali Hotel" } }),
  'villa@indostreet.com': createMockPartner('uuid-lodging-villa', 'villa@indostreet.com', PartnerType.Villa, Role.LodgingPartner, { profile: { name: "Canggu Private Villa" } }),
};


// --- Authentication ---

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    console.warn("Using MOCK login. All data fetching is still live from Supabase.");
    if (password !== 'password') {
        throw new Error('Invalid login credentials.');
    }
    const user = mockUsers[email];
    if (user) {
        localStorage.setItem('mockUser', JSON.stringify(user));
        return { user, token: 'mock-token-for-' + email };
    }
    throw new Error('Invalid login credentials.');
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('mockUser');
  await supabase.auth.signOut();
};

export const checkSession = async (): Promise<User | null> => {
    const mockUserJson = localStorage.getItem('mockUser');
    if (mockUserJson) {
        return JSON.parse(mockUserJson) as User;
    }
    return null;
};


// --- Admin API ---
export const getAdminStats = async (): Promise<AdminStats> => {
    // This runs multiple queries. For performance on a large scale,
    // you might create a database function (RPC) to get all stats in one call.
    const { count: totalPartners } = await supabase.from('partners').select('*', { count: 'exact', head: true });
    const { count: pendingApplications } = await supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: activeDrivers } = await supabase.from('partners').select('*', { count: 'exact', head: true }).eq('role', Role.Driver).eq('status', 'active');
    const { count: activeVendors } = await supabase.from('partners').select('*', { count: 'exact', head: true }).in('role', [Role.Vendor, Role.LodgingPartner]).eq('status', 'active');
    const { count: pendingRenewals } = await supabase.from('renewal_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingAgentSignups } = await supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval');
    const { count: pendingAgentApplications } = await supabase.from('agent_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending');

    return {
        totalPartners: totalPartners || 0,
        pendingApplications: pendingApplications || 0,
        activeDrivers: activeDrivers || 0,
        activeVendorsAndBusinesses: activeVendors || 0,
        pendingRenewals: pendingRenewals || 0,
        pendingAgentSignups: pendingAgentSignups || 0,
        pendingAgentApplications: pendingAgentApplications || 0,
    };
};

export const getApplications = async (): Promise<PartnerApplication[]> => {
    const { data, error } = await supabase.from('applications').select('*');
    if (error) throw error;
    return data || [];
};

export const getPartners = async (): Promise<Partner[]> => {
    const { data, error } = await supabase.from('partners').select('*');
    if (error) throw error;
    return data || [];
};

export const updateApplication = async (id: string, status: 'approved' | 'rejected'): Promise<PartnerApplication> => {
    const { data, error } = await supabase.from('applications').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    // In a real app, you might have a trigger/function to automatically create a partner from an approved application.
    return data;
};

// --- Partners API ---
export const getPartner = async (id: string): Promise<Partner> => {
    // Similar to checkSession, check both tables
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', id).single();
    if (partnerData) return partnerData as Partner;
    
    const { data: userData } = await supabase.from('users').select('*').eq('id', id).single();
    if (userData) return userData as Partner; // Cast to Partner for compatibility where needed

    throw new Error("Partner or User not found");
};

export const updatePartner = async (id: string, data: Partial<Partner>): Promise<Partner> => {
    const { data: updatedData, error } = await supabase.from('partners').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updatedData;
};

// ===================================================================================
// IMPLEMENTED API FUNCTIONS
// ===================================================================================

export const getAgents = async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*').eq('role', Role.Agent);
    if (error) throw error;
    return (data as User[]) || [];
};

export const getAllProspects = async (): Promise<Prospect[]> => {
    const { data, error } = await supabase.from('prospects').select('*');
    if (error) throw error;
    return data || [];
};

// Mocked as it would require complex aggregation or a DB function (RPC)
export const getAnalyticsSummary = async (): Promise<AnalyticsSummary> => {
    console.warn(`getAnalyticsSummary is not implemented with Supabase yet. Returning mock data.`);
    return Promise.resolve({
        partnerGrowth: { total: 125, change: 12.5 },
        rideAndOrderVolume: { total: 15230, change: -2.1 },
        popularServices: [
            { name: PartnerType.BikeDriver, count: 7200 },
            { name: PartnerType.FoodVendor, count: 4500 },
            { name: PartnerType.CarDriver, count: 2100 },
            { name: PartnerType.MassageTherapist, count: 950 },
        ],
        peakHours: [
            { hour: '08:00 AM', count: 900 },
            { hour: '12:00 PM', count: 1200 },
            { hour: '06:00 PM', count: 1100 },
            { hour: '07:00 PM', count: 1050 },
        ],
    });
};

export const broadcastMessage = async (content: string): Promise<AdminMessage> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated to broadcast message.");

    const { data, error } = await supabase.from('messages').insert({ senderId: user.id, recipientId: 'all', content, readBy: [] }).select().single();
    if (error) throw error;
    return data;
};

export const getTransactions = async (): Promise<Transaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) throw error;
    return data || [];
};

export const getTransactionsForPartner = async (partnerId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase.from('transactions').select('*').eq('partnerId', partnerId);
    if (error) throw error;
    return data || [];
};

export const updateTransaction = async (id: string, updateData: Partial<Transaction>): Promise<Transaction> => {
    const { data, error } = await supabase.from('transactions').update(updateData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getAllVendorItems = async (): Promise<VendorItem[]> => {
    const { data, error } = await supabase.from('vendor_items').select('*');
    if (error) throw error;
    return data || [];
};

export const getVendorItems = async (vendorId: string): Promise<VendorItem[]> => {
    const { data, error } = await supabase.from('vendor_items').select('*').eq('vendorId', vendorId);
    if (error) throw error;
    return data || [];
};

export const createVendorItem = async (vendorId: string, itemData: Omit<VendorItem, 'id' | 'vendorId'>): Promise<VendorItem> => {
    const { data, error } = await supabase.from('vendor_items').insert({ ...itemData, vendorId }).select().single();
    if (error) throw error;
    return data;
};

export const updateVendorItem = async (itemId: string, itemData: Partial<VendorItem>): Promise<VendorItem> => {
    const { data, error } = await supabase.from('vendor_items').update(itemData).eq('id', itemId).select().single();
    if (error) throw error;
    return data;
};

export const deleteVendorItem = async (itemId: string): Promise<void> => {
    const { error } = await supabase.from('vendor_items').delete().eq('id', itemId);
    if (error) throw error;
};

// Mocked as this is usually a real-time feature (e.g., using Supabase Realtime)
export const getRideRequests = async (): Promise<RideRequest[]> => {
    console.warn(`getRideRequests is not implemented with Supabase yet. Returning mock data.`);
    const mockRequest: RideRequest = {
        id: `ride-${Date.now()}`,
        pickupLocation: 'Grand Indonesia, Jakarta',
        destination: 'Blok M Square, Jakarta',
        fare: 45000,
        customerName: 'Budi S.',
        customerRating: 4.8,
    };
    // Randomly return a request to simulate real-world conditions
    return Promise.resolve(Math.random() > 0.6 ? [mockRequest] : []);
};


export const getFeedbackForPartner = async (partnerId: string): Promise<Feedback[]> => {
    const { data, error } = await supabase.from('feedback').select('*').eq('partnerId', partnerId);
    if (error) throw error;
    return data || [];
};

export const getPayoutsForPartner = async (partnerId: string): Promise<Payout[]> => {
    const { data, error } = await supabase.from('payouts').select('*').eq('partnerId', partnerId);
    if (error) throw error;
    return data || [];
};

export const getMessages = async (): Promise<AdminMessage[]> => {
    const { data, error } = await supabase.from('messages').select('*');
    if (error) throw error;
    return data || [];
};

export const getMessagesForPartner = async (partnerId: string): Promise<AdminMessage[]> => {
    const { data, error } = await supabase.from('messages').select('*').or(`recipientId.eq.${partnerId},recipientId.eq.all`);
    if (error) throw error;
    return data || [];
};

export const sendMessage = async (recipientId: string, content: string): Promise<AdminMessage> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated to send message.");

    const { data, error } = await supabase.from('messages').insert({ senderId: user.id, recipientId, content, readBy: [] }).select().single();
    if (error) throw error;
    return data;
};

export const updateMessage = async (messageId: string, updateData: Partial<AdminMessage>): Promise<AdminMessage> => {
    const { data, error } = await supabase.from('messages').update(updateData).eq('id', messageId).select().single();
    if (error) throw error;
    return data;
};

export const getTourDestinations = async (): Promise<TourDestination[]> => {
    const { data, error } = await supabase.from('tour_destinations').select('*');
    if (error) throw error;
    return data || [];
};

export const createTourDestination = async (destinationData: Omit<TourDestination, 'id'>): Promise<TourDestination> => {
    const { data, error } = await supabase.from('tour_destinations').insert(destinationData).select().single();
    if (error) throw error;
    return data;
};

export const updateTourDestination = async (id: string, destinationData: Partial<TourDestination>): Promise<TourDestination> => {
    const { data, error } = await supabase.from('tour_destinations').update(destinationData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deleteTourDestination = async (id: string): Promise<void> => {
    const { error } = await supabase.from('tour_destinations').delete().eq('id', id);
    if (error) throw error;
};

export const getContentOverrides = async (): Promise<ContentOverrides> => {
    // Assuming a single row with id=1 for site-wide content
    const { data, error } = await supabase.from('content_overrides').select('*').eq('id', 1).maybeSingle();
    if (error) throw error;
    return data || { text: {}, numbers: {}, assets: {} };
};

export const updateContentOverrides = async (newOverrides: ContentOverrides): Promise<ContentOverrides> => {
    // Upsert the single row with id=1
    const { data, error } = await supabase.from('content_overrides').upsert({ id: 1, ...newOverrides }).select().single();
    if (error) throw error;
    return data;
};

export const getRenewalSubmissions = async (): Promise<RenewalSubmission[]> => {
    const { data, error } = await supabase.from('renewal_submissions').select('*');
    if (error) throw error;
    return data || [];
};

export const createRenewalSubmission = async (submissionData: Omit<RenewalSubmission, 'id' | 'submittedAt' | 'status'>): Promise<RenewalSubmission> => {
    const { data, error } = await supabase.from('renewal_submissions').insert(submissionData).select().single();
    if (error) throw error;
    return data;
};

export const updateRenewalSubmission = async (id: string, submissionData: Partial<RenewalSubmission>): Promise<RenewalSubmission> => {
    const { data, error } = await supabase.from('renewal_submissions').update(submissionData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getVehicles = async (): Promise<Vehicle[]> => {
    const { data, error } = await supabase.from('vehicles').select('*');
    if (error) throw error;
    return data || [];
};

export const createVehicle = async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const { data, error } = await supabase.from('vehicles').insert(vehicleData).select().single();
    if (error) throw error;
    return data;
};

export const updateVehicle = async (id: string, vehicleData: Partial<Omit<Vehicle, 'id'>>): Promise<Vehicle> => {
    const { data, error } = await supabase.from('vehicles').update(vehicleData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const deleteVehicle = async (id: string): Promise<void> => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) throw error;
};

export const getRoomsForProperty = async (vendorId: string): Promise<Room[]> => {
    const { data, error } = await supabase.from('rooms').select('*').eq('vendorId', vendorId);
    if (error) throw error;
    return data || [];
};

export const createRoom = async (vendorId: string, roomData: Omit<Room, 'id' | 'vendorId'>): Promise<Room> => {
    const { data, error } = await supabase.from('rooms').insert({ ...roomData, vendorId }).select().single();
    if (error) throw error;
    return data;
};

export const updateRoom = async (roomId: string, roomData: Partial<Omit<Room, 'id'>>): Promise<Room> => {
    const { data, error } = await supabase.from('rooms').update(roomData).eq('id', roomId).select().single();
    if (error) throw error;
    return data;
};

export const deleteRoom = async (roomId: string): Promise<void> => {
    const { error } = await supabase.from('rooms').delete().eq('id', roomId);
    if (error) throw error;
};

export const getMembers = async (): Promise<Member[]> => {
    const { data, error } = await supabase.from('members').select('*');
    if (error) throw error;
    return data || [];
};

export const updateMember = async (id: string, memberData: Partial<Member>): Promise<Member> => {
    const { data, error } = await supabase.from('members').update(memberData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getProspectsForAgent = async (agentId: string): Promise<Prospect[]> => {
    const { data, error } = await supabase.from('prospects').select('*').eq('agentId', agentId);
    if (error) throw error;
    return data || [];
};

export const getPartnersForAgent = async (agentId: string): Promise<Partner[]> => {
    const { data, error } = await supabase.from('partners').select('*').eq('agentId', agentId);
    if (error) throw error;
    return data || [];
};

export const createProspect = async (agentId: string, prospectData: Omit<Prospect, 'id' | 'agentId' | 'createdAt' | 'status'>): Promise<Prospect> => {
    const { data, error } = await supabase.from('prospects').insert({ ...prospectData, agentId, status: 'prospect' }).select().single();
    if (error) throw error;
    return data;
};

export const updateProspect = async (id: string, prospectData: Partial<Prospect>): Promise<Prospect> => {
    const { data, error } = await supabase.from('prospects').update(prospectData).eq('id', id).select().single();
    if (error) throw error;
    return data;
};

export const getAgentApplications = async (): Promise<AgentApplication[]> => {
    const { data, error } = await supabase.from('agent_applications').select('*');
    if (error) throw error;
    return data || [];
};

export const updateAgentApplicationStatus = async (id: string, status: 'approved' | 'rejected'): Promise<AgentApplication> => {
    const { data, error } = await supabase.from('agent_applications').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    // In a real app, you would have a trigger/function to create a user and agent profile on approval.
    return data;
};

export const submitAgentApplication = async (applicationData: Omit<AgentApplication, 'id' | 'status' | 'submittedAt'>): Promise<AgentApplication> => {
    const { data, error } = await supabase.from('agent_applications').insert(applicationData).select().single();
    if (error) throw error;
    return data;
};

export const getMassageTypes = async (): Promise<MassageType[]> => {
    const { data, error } = await supabase.from('massage_types').select('*');
    if (error) throw error;
    return data || [];
};

export const createMassageType = async (data: Omit<MassageType, 'id'>): Promise<MassageType> => {
    const { data: result, error } = await supabase.from('massage_types').insert(data).select().single();
    if (error) throw error;
    return result;
};

export const updateMassageType = async (id: string, data: Partial<Omit<MassageType, 'id'>>): Promise<MassageType> => {
    const { data: result, error } = await supabase.from('massage_types').update(data).eq('id', id).select().single();
    if (error) throw error;
    return result;
};

export const deleteMassageType = async (id: string): Promise<void> => {
    const { error } = await supabase.from('massage_types').delete().eq('id', id);
    if (error) throw error;
};
