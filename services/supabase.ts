

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
  FoodType,
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
    channel: () => ({
        on: () => ({
            subscribe: () => {}
        }),
        subscribe: () => {}
    }),
    removeChannel: () => {}
  } as unknown as SupabaseClient;

} else {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export { supabase };


// --- Authentication ---

// Helper to build a User object from DB data based on an authenticated user
const buildUserFromDb = async (authUserId: string, email: string): Promise<User | null> => {
    const checkTableError = (error: any, tableName: string) => {
        if (!error) {
            return;
        }
        
        // Centralized error message pointing to the new setup page
        const setupGuideMessage = "Please go to the 'Database Setup' page in the admin dashboard for the complete SQL scripts to create and fix your tables. If you cannot log in, the SQL for the 'users', 'partners', and 'members' tables is provided below.";

        // 42P01: undefined_table. This is a clear setup problem.
        if (error.code === '42P01') {
            throw new Error(`Database setup incomplete: The '${tableName}' table is missing. ${setupGuideMessage}`);
        }

        // 22P02: invalid_text_representation. Happens when a UUID is passed to a bigint/integer column.
        if (error.code === '22P02' && error.message.includes('bigint')) {
             let createTableSql = '';
            // Only provide SQL for login-critical tables on the login page.
            switch (tableName) {
                case 'partners':
                    createTableSql = `
CREATE TABLE public.partners (
    id uuid NOT NULL PRIMARY KEY, email text NOT NULL, "role" text NOT NULL, "profile" jsonb NULL, "partnerType" text NOT NULL, status text NOT NULL DEFAULT 'pending'::text, rating numeric NOT NULL DEFAULT 0, "totalEarnings" numeric NOT NULL DEFAULT 0, "memberSince" timestamptz NOT NULL DEFAULT now(), phone text NULL, "activationExpiry" timestamptz NULL, "rideRatePerKm" numeric NULL, "minFare" numeric NULL, "parcelRatePerKm" numeric NULL, "hourlyHireRate" numeric NULL, "dailyHireRate" numeric NULL, "tourRates" jsonb NULL, "bankDetails" jsonb NULL, "rentalDetails" jsonb NULL, bio text NULL, "massageStatus" text NULL, "massageServices" text[] NULL, "massagePricing" jsonb NULL, "galleryImages" jsonb NULL, amenities jsonb NULL, "otherAmenities" text NULL, "businessHours" text NULL, "location" jsonb NULL, description text NULL, address text NULL, street text NULL, photos jsonb NULL, "checkInTime" time without time zone NULL, "airportPickup" boolean NULL, "loyaltyRewardEnabled" boolean NULL, "hotelVillaAmenities" jsonb NULL, "agentId" uuid NULL, "acceptanceRate" numeric NULL, "cancellationRate" numeric NULL, "privateInfo" jsonb NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT partners_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);`;
                    break;
                case 'users':
                    createTableSql = `
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY, email text NOT NULL, "role" text NOT NULL, "profile" jsonb NULL, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);`;
                    break;
                case 'members':
                    createTableSql = `
CREATE TABLE public.members (
    id uuid NOT NULL PRIMARY KEY, "whatsappNumber" text NOT NULL, name text NULL, email text NOT NULL, "lastKnownLocation" text NULL, status text NOT NULL DEFAULT 'active'::text, "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT members_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);`;
                    break;
            }

            const improvedMessage = `Database schema error in '${tableName}' table: The 'id' column is 'bigint' but should be 'uuid'.
This commonly happens because the Supabase dashboard defaults new 'id' columns to 'bigint'. For user-related tables, it must be 'uuid' to link to the authentication system.
${setupGuideMessage}
---
-- SQL to fix the '${tableName}' table schema.
-- WARNING: This will DELETE the existing table and all its data.
-- Please back up any important data before running this!
DROP TABLE public.${tableName};
${createTableSql ? createTableSql.trim() : ''}
---`;
            throw new Error(improvedMessage);
        }
        
        // PGRST116: The result contains 0 rows. This is an expected outcome of .single() when a user isn't in a given table. We just continue.
        if (error.code === 'PGRST116') {
            return;
        }

        // For any other unexpected error, we serialize it robustly for the UI.
        console.error(`Unexpected Supabase error when querying '${tableName}':`, error);
        
        let detailMessage = '';
        if (error && typeof error === 'object') {
            const parts = [];
            // This logic robustly extracts string properties to prevent '[object Object]'.
            if (error.message && typeof error.message === 'string') parts.push(error.message);
            if (error.details && typeof error.details === 'string') parts.push(`Details: ${error.details}`);
            if (error.hint && typeof error.hint === 'string') parts.push(`Hint: ${error.hint}`);
            if (error.code && typeof error.code === 'string') parts.push(`Code: ${error.code}`);
            if (parts.length > 0) {
              detailMessage = parts.join('\n');
            }
        }
        
        // If standard properties were not found, try to serialize the whole object for debugging.
        if (!detailMessage.trim()) {
             try {
                detailMessage = `Raw error object:\n${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`;
             } catch {
                detailMessage = "An unexpected and non-serializable error occurred. The raw error object has been logged to the browser's developer console for inspection.";
             }
        }
        
        throw new Error(`A database error occurred on table '${tableName}'. This is often due to misconfigured Row Level Security (RLS) policies. Please check your Supabase policies.\n\nError details:\n${detailMessage}`);
    };

    // Check partners table
    const { data: partnerData, error: partnerError } = await supabase.from('partners').select('*').eq('id', authUserId).single();
    checkTableError(partnerError, 'partners');
    if (partnerData) return partnerData as User;
    
    // Check general users table (for admin, agent)
    const { data: userData, error: userError } = await supabase.from('users').select('*').eq('id', authUserId).single();
    checkTableError(userError, 'users');
    if (userData) return userData as User;
    
    // Check members table
    const { data: memberData, error: memberError } = await supabase.from('members').select('*').eq('id', authUserId).single();
    checkTableError(memberError, 'members');
    if (memberData) {
        const member = memberData as Member;
        return {
            id: member.id,
            email: member.email,
            role: Role.Member,
            profile: { name: member.name },
        };
    }
    
    return null;
};


export const login = async (email: string, password: string): Promise<{ user: User; token: string }> => {
    // For maintenance mode, we don't need a real password check.
    if (email === 'admin@setup.com') {
         console.warn("Attempting Setup & Recovery Mode login.");
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError && email !== 'admin@setup.com') { // For regular users, auth error is final.
        throw authError;
    }
    
    // If auth succeeds OR it's a maintenance login attempt, try to build the user profile.
    const userId = authData?.user?.id || 'maintenance-admin';
    const userEmail = authData?.user?.email || 'admin@setup.com';
    
    try {
        const userProfile = await buildUserFromDb(userId, userEmail);

        // If a profile is found, login is successful for any user.
        if (userProfile) {
            console.log("Successful login with Supabase Auth.");
            return { user: userProfile, token: authData!.session!.access_token };
        }

        // If no profile is found, it could be an RLS issue. For a normal user, this is a critical error.
        // For the setup admin, this is the trigger to enter maintenance mode. We throw to unify the logic in the catch block.
        throw new Error("User profile not found in database (this is expected for setup admin, but an error for regular users).");

    } catch (dbError: any) {
        // --- Setup & Recovery Mode Logic ---
        // For admin@setup.com, ANY database error (missing table, RLS issue, or just no profile row)
        // should trigger maintenance mode. This guarantees access to diagnostic tools.
        if (email === 'admin@setup.com') {
            console.warn("Database issue during setup login; entering Maintenance Mode.", dbError.message);
            const maintenanceUser: User = {
                id: 'maintenance-admin',
                email: 'admin@setup.com',
                role: Role.Admin,
                profile: { name: 'Setup Admin' },
                isMaintenanceMode: true,
            };
            return { user: maintenanceUser, token: 'maintenance-token' };
        }

        // For regular users, sign out and re-throw the original, more descriptive error.
        await supabase.auth.signOut();
        throw dbError;
    }
};

export const logout = async (): Promise<void> => {
  await supabase.auth.signOut();
};

export const checkSession = async (): Promise<User | null> => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session && session.user) {
        try {
            const userProfile = await buildUserFromDb(session.user.id, session.user.email!);
            if (userProfile) {
                return userProfile;
            }
        } catch (e) {
            console.error("Database error during session check, logging out.", e);
        }
        // If user is in Auth but not DB (or DB error), sign out to clear session.
        await supabase.auth.signOut();
    }
    return null;
};


export const signUpMember = async (name: string, email: string, password: string, whatsapp: string, area: Zone): Promise<void> => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
    });

    if (authError) {
        throw authError;
    }
    if (!authData.user) {
        throw new Error('Sign up successful, but no user data returned.');
    }

    const userId = authData.user.id;

    const { error: insertError } = await supabase.from('members').insert({
        id: userId,
        name,
        email,
        whatsappNumber: whatsapp,
        lastKnownLocation: area,
        status: 'active',
        createdAt: new Date().toISOString(),
    });

    if (insertError) {
        console.error('Auth user created, but DB insert failed:', insertError);
        throw new Error('Could not create your member profile. Please contact support.');
    }
};

// --- Storage Helpers ---
export const uploadFile = async (bucket: string, file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error("Supabase storage upload error:", uploadError);
        throw new Error(`Failed to upload file to bucket '${bucket}'. Check storage policies and bucket existence.`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
};

export const deleteFileByUrl = async (bucket: string, url: string): Promise<void> => {
    if (!url || !url.includes(supabaseUrl!)) return; // Don't try to delete non-supabase URLs
    try {
        const path = new URL(url).pathname.split(`/${bucket}/`)[1];
        if (path) {
            const { error } = await supabase.storage.from(bucket).remove([path]);
            if (error) {
                console.error("Failed to delete file from storage:", error.message);
            }
        }
    } catch (error) {
        console.error("Error parsing URL for file deletion:", error);
    }
};


// --- Admin API ---
export const getAdminStats = async (): Promise<AdminStats> => {
    // This runs multiple queries in parallel for better performance.
    const queries = [
        supabase.from('partners').select('*', { count: 'exact', head: true }),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('partners').select('*', { count: 'exact', head: true }).eq('role', Role.Driver).eq('status', 'active'),
        supabase.from('partners').select('*', { count: 'exact', head: true }).in('role', [Role.Vendor, Role.LodgingPartner]).eq('status', 'active'),
        supabase.from('renewal_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
        supabase.from('agent_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending')
    ];

    const results = await Promise.all(queries);

    for (const result of results) {
        if (result.error) {
            console.error('Error fetching admin stats:', result.error.message || result.error);
            throw result.error;
        }
    }

    const [
        totalPartnersResult,
        pendingApplicationsResult,
        activeDriversResult,
        activeVendorsResult,
        pendingRenewalsResult,
        pendingAgentSignupsResult,
        pendingAgentApplicationsResult
    ] = results;

    return {
        totalPartners: totalPartnersResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        activeDrivers: activeDriversResult.count || 0,
        activeVendorsAndBusinesses: activeVendorsResult.count || 0,
        pendingRenewals: pendingRenewalsResult.count || 0,
        pendingAgentSignups: pendingAgentSignupsResult.count || 0,
        pendingAgentApplications: pendingAgentApplicationsResult.count || 0,
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

// --- Food Directory API ---
export const getFoodTypes = async (): Promise<FoodType[]> => {
    const { data, error } = await supabase.from('food_types').select('*');
    if (error) throw error;
    return data || [];
};

export const createFoodType = async (data: Omit<FoodType, 'id'>): Promise<FoodType> => {
    const cleanedName = data.name.replace(/\s+/g, ' ').trim();
    const processedData = { ...data, name: cleanedName };
    if (!processedData.name) {
        throw new Error("Food type name cannot be empty.");
    }
    
    const { data: existing, error: checkError } = await supabase
        .from('food_types')
        .select('id')
        .ilike('name', processedData.name)
        .limit(1);

    if (checkError) {
        console.error("Supabase check error:", checkError);
        throw new Error(checkError.message);
    }

    if (existing && existing.length > 0) {
        throw new Error(`A food type with the name "${processedData.name}" already exists. Please choose a different name.`);
    }

    const { data: results, error } = await supabase.from('food_types').insert(processedData).select();
    
    if (error) {
        console.error("Supabase insert error:", error);
        // Handle unique constraint violation specifically for a better UX
        if (error.code === '23505') {
            throw new Error(`A food type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
        throw new Error(error.message);
    }
    if (!results || results.length === 0) {
        throw new Error(`Create failed for new Food Type. This is likely a Row Level Security (RLS) issue.`);
    }
    return results[0];
};

export const updateFoodType = async (id: string, data: Partial<Omit<FoodType, 'id'>>): Promise<FoodType> => {
    const processedData = { ...data };
    if (data.name) {
        const cleanedName = data.name.replace(/\s+/g, ' ').trim();
        processedData.name = cleanedName;

        if (!processedData.name) {
            throw new Error("Food type name cannot be empty.");
        }
        
        const { data: existing, error: checkError } = await supabase
            .from('food_types')
            .select('id')
            .ilike('name', processedData.name)
            .not('id', 'eq', id)
            .limit(1);

        if (checkError) {
            console.error("Supabase check error:", checkError);
            throw new Error(checkError.message);
        }

        if (existing && existing.length > 0) {
            throw new Error(`A food type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
    }

    const { data: results, error } = await supabase.from('food_types').update(processedData).eq('id', id).select();
    if (error) {
        console.error("Supabase update error:", error);
         if (error.code === '23505') {
            throw new Error(`A food type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
        throw new Error(error.message);
    }
    if (!results || results.length === 0) {
        throw new Error(`Update failed for Food Type ID: ${id}. The item was not found or you do not have permission to modify it.`);
    }
    return results[0];
};

export const deleteFoodType = async (id: string): Promise<void> => {
    const { error } = await supabase.from('food_types').delete().eq('id', id);
    if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(error.message);
    }
};

export const getMassageTypes = async (): Promise<MassageType[]> => {
    const { data, error } = await supabase.from('massage_types').select('*');
    if (error) throw error;
    return data || [];
};

export const createMassageType = async (data: Omit<MassageType, 'id'>): Promise<MassageType> => {
    const cleanedName = data.name.replace(/\s+/g, ' ').trim();
    const processedData = { ...data, name: cleanedName };
    if (!processedData.name) {
        throw new Error("Massage type name cannot be empty.");
    }
    
    const { data: existing, error: checkError } = await supabase
        .from('massage_types')
        .select('id')
        .ilike('name', processedData.name)
        .limit(1);

    if (checkError) {
        console.error("Supabase check error:", checkError);
        throw new Error(checkError.message);
    }

    if (existing && existing.length > 0) {
        throw new Error(`A massage type with the name "${processedData.name}" already exists. Please choose a different name.`);
    }

    const { data: results, error } = await supabase.from('massage_types').insert(processedData).select();

    if (error) {
        console.error("Supabase insert error:", error);
         if (error.code === '23505') {
            throw new Error(`A massage type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
        throw new Error(error.message);
    }
    if (!results || results.length === 0) {
        throw new Error(`Create failed for new Massage Type. This is likely a Row Level Security (RLS) issue.`);
    }
    return results[0];
};

export const updateMassageType = async (id: string, data: Partial<Omit<MassageType, 'id'>>): Promise<MassageType> => {
    const processedData = { ...data };
    if (data.name) {
        const cleanedName = data.name.replace(/\s+/g, ' ').trim();
        processedData.name = cleanedName;
        if (!processedData.name) {
            throw new Error("Massage type name cannot be empty.");
        }
        
        const { data: existing, error: checkError } = await supabase
            .from('massage_types')
            .select('id')
            .ilike('name', processedData.name)
            .not('id', 'eq', id)
            .limit(1);

        if (checkError) {
            console.error("Supabase check error:", checkError);
            throw new Error(checkError.message);
        }

        if (existing && existing.length > 0) {
            throw new Error(`A massage type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
    }
    const { data: results, error } = await supabase
        .from('massage_types')
        .update(processedData)
        .eq('id', id)
        .select();

    if (error) {
        console.error("Supabase update error:", error);
         if (error.code === '23505') {
            throw new Error(`A massage type with the name "${processedData.name}" already exists. Please choose a different name.`);
        }
        throw new Error(error.message);
    }
    
    if (!results || results.length === 0) {
        throw new Error(`Update failed for Massage Type ID: ${id}. The item was not found or you don't have permission to modify it.`);
    }

    return results[0];
};


export const deleteMassageType = async (id: string): Promise<void> => {
    const { error } = await supabase.from('massage_types').delete().eq('id', id);
    if (error) {
        console.error("Supabase delete error:", error);
        throw new Error(error.message);
    }
};