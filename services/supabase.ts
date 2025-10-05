
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

  // Create a minimal mock client to prevent the app from crashing on load.
  // This allows the app to render the login page where the error can be displayed.
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


// --- Authentication ---

export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (authError || !authData.user) {
        throw new Error(authError?.message || 'Login failed. Please check your credentials.');
    }
    
    // In our data model, Admins/Agents are in a `users` table, and others are in a `partners` table.
    // We'll try fetching from partners first.
    const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', authData.user.id)
        .single();

    if (partnerData && !partnerError) {
        return { user: partnerData as User, token: authData.session.access_token };
    }

    // If not found in partners, check the users table.
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    
    if (userData && !userError) {
        return { user: userData as User, token: authData.session.access_token };
    }
    
    // If profile is not found in either table, something is wrong.
    throw new Error(partnerError?.message || userError?.message || 'Login succeeded but could not find user profile.');
};


export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const checkSession = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    // Try fetching from partners first, then users
    const { data: partnerData } = await supabase.from('partners').select('*').eq('id', session.user.id).single();
    if (partnerData) return partnerData as Partner;
    
    const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).single();
    if (userData) return userData as User;

    // If no profile found, the auth session is likely for a deleted user. Sign out.
    await supabase.auth.signOut();
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
// STUBBED OUT API FUNCTIONS - These need to be converted to use Supabase
// ===================================================================================

// FIX: Accept any arguments for stubbed functions to prevent "Expected 0 arguments, but got 1" errors.
const notImplemented = (functionName: string) => (...args: any[]) => {
    console.warn(`${functionName} is not implemented with Supabase yet. Returning empty data.`);
    return Promise.resolve([]);
};

const notImplementedObj = (functionName: string) => (...args: any[]) => {
    console.warn(`${functionName} is not implemented with Supabase yet. Returning empty data.`);
    return Promise.resolve({});
};

const notImplementedVoid = (functionName: string) => (...args: any[]) => {
    console.warn(`${functionName} is not implemented with Supabase yet.`);
    return Promise.resolve();
};

export const getAgents = notImplemented('getAgents');
export const getAllProspects = notImplemented('getAllProspects');
export const getAnalyticsSummary = notImplementedObj('getAnalyticsSummary') as () => Promise<AnalyticsSummary>;
// FIX: Use 'as unknown as' for type casting to resolve complex conversion errors.
export const broadcastMessage = notImplementedObj('broadcastMessage') as unknown as (content: string) => Promise<AdminMessage>;
export const getTransactions = notImplemented('getTransactions');
export const getTransactionsForPartner = notImplemented('getTransactionsForPartner');
export const updateTransaction = notImplementedObj('updateTransaction') as unknown as (id: string, data: Partial<Transaction>) => Promise<Transaction>;
export const getAllVendorItems = notImplemented('getAllVendorItems');
export const getVendorItems = notImplemented('getVendorItems');
export const createVendorItem = notImplementedObj('createVendorItem') as unknown as (vendorId: string, data: Omit<VendorItem, 'id' | 'vendorId'>) => Promise<VendorItem>;
export const updateVendorItem = notImplementedObj('updateVendorItem') as unknown as (itemId: string, data: Partial<VendorItem>) => Promise<VendorItem>;
export const deleteVendorItem = notImplementedVoid('deleteVendorItem');
export const getRideRequests = notImplemented('getRideRequests');
export const getFeedbackForPartner = notImplemented('getFeedbackForPartner');
export const getPayoutsForPartner = notImplemented('getPayoutsForPartner');
export const getMessages = notImplemented('getMessages');
export const getMessagesForPartner = notImplemented('getMessagesForPartner');
export const sendMessage = notImplementedObj('sendMessage') as unknown as (recipientId: string, content: string) => Promise<AdminMessage>;
export const updateMessage = notImplementedObj('updateMessage') as unknown as (messageId: string, data: Partial<AdminMessage>) => Promise<AdminMessage>;
export const getTourDestinations = notImplemented('getTourDestinations');
export const createTourDestination = notImplementedObj('createTourDestination') as unknown as (data: Omit<TourDestination, 'id'>) => Promise<TourDestination>;
export const updateTourDestination = notImplementedObj('updateTourDestination') as unknown as (id: string, data: Partial<TourDestination>) => Promise<TourDestination>;
export const deleteTourDestination = notImplementedVoid('deleteTourDestination');
export const getContentOverrides = notImplementedObj('getContentOverrides') as () => Promise<ContentOverrides>;
export const updateContentOverrides = notImplementedObj('updateContentOverrides') as unknown as (newOverrides: ContentOverrides) => Promise<ContentOverrides>;
export const getRenewalSubmissions = notImplemented('getRenewalSubmissions');
export const createRenewalSubmission = notImplementedObj('createRenewalSubmission') as unknown as (data: Omit<RenewalSubmission, 'id' | 'submittedAt' | 'status'>) => Promise<RenewalSubmission>;
export const updateRenewalSubmission = notImplementedObj('updateRenewalSubmission') as unknown as (id: string, data: Partial<RenewalSubmission>) => Promise<RenewalSubmission>;
export const getVehicles = notImplemented('getVehicles');
export const createVehicle = notImplementedObj('createVehicle') as unknown as (data: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
export const updateVehicle = notImplementedObj('updateVehicle') as unknown as (id: string, data: Partial<Omit<Vehicle, 'id'>>) => Promise<Vehicle>;
export const deleteVehicle = notImplementedVoid('deleteVehicle');
export const getRoomsForProperty = notImplemented('getRoomsForProperty');
export const createRoom = notImplementedObj('createRoom') as unknown as (vendorId: string, data: Omit<Room, 'id' | 'vendorId'>) => Promise<Room>;
export const updateRoom = notImplementedObj('updateRoom') as unknown as (roomId: string, data: Partial<Omit<Room, 'id'>>) => Promise<Room>;
export const deleteRoom = notImplementedVoid('deleteRoom');
export const getMembers = notImplemented('getMembers');
export const updateMember = notImplementedObj('updateMember') as unknown as (id: string, data: Partial<Member>) => Promise<Member>;
export const getProspectsForAgent = notImplemented('getProspectsForAgent');
export const getPartnersForAgent = notImplemented('getPartnersForAgent');
export const createProspect = notImplementedObj('createProspect') as unknown as (agentId: string, data: Omit<Prospect, 'id' | 'agentId' | 'createdAt' | 'status'>) => Promise<Prospect>;
export const updateProspect = notImplementedObj('updateProspect') as unknown as (id: string, data: Partial<Prospect>) => Promise<Prospect>;
export const getAgentApplications = notImplemented('getAgentApplications');
export const updateAgentApplicationStatus = notImplementedObj('updateAgentApplicationStatus') as unknown as (id: string, status: 'approved' | 'rejected') => Promise<AgentApplication>;
export const submitAgentApplication = notImplementedObj('submitAgentApplication') as unknown as (data: Omit<AgentApplication, 'id' | 'status' | 'submittedAt'>) => Promise<AgentApplication>;
export const getMassageTypes = notImplemented('getMassageTypes');
export const createMassageType = notImplementedObj('createMassageType') as unknown as (data: Omit<MassageType, 'id'>) => Promise<MassageType>;
export const updateMassageType = notImplementedObj('updateMassageType') as unknown as (id: string, data: Partial<Omit<MassageType, 'id'>>) => Promise<MassageType>;
export const deleteMassageType = notImplementedVoid('deleteMassageType');
