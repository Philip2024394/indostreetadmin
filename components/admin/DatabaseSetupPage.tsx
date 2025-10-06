import React from 'react';
import SqlCopyBlock from '../shared/SqlCopyBlock';

const DatabaseSetupPage: React.FC = () => {
    const rlsAndPolicyTemplate = (tableName: string) => `
-- 1. Enable Row Level Security
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- 2. Create/update a single, permissive policy for development.
-- This script is idempotent (safe to run multiple times).
-- WARNING: This policy is wide open for development to support the "live admin" login bypass.
-- It allows ANY user (anonymous or logged-in) to perform any action.
-- For production, you MUST restrict this for a production environment.

-- Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Allow all access to all users" ON public.${tableName};
DROP POLICY IF EXISTS "Enable read access for all users" ON public.${tableName};

-- Create the single permissive policy for all actions
CREATE POLICY "Allow all access to all users" ON public.${tableName}
FOR ALL
USING (true)
WITH CHECK (true);
`;

    const sqlScripts = {
        users: `
-- Table for non-partner users like admins and agents
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    "role" text NOT NULL,
    "profile" jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('users')}`,
        partners: `
-- Table for all partners (drivers, vendors, etc.)
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.partners CASCADE;
CREATE TABLE public.partners (
    id uuid NOT NULL PRIMARY KEY,
    email text NOT NULL,
    "role" text NOT NULL,
    "profile" jsonb NULL,
    "partnerType" text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    rating numeric NOT NULL DEFAULT 0,
    "totalEarnings" numeric NOT NULL DEFAULT 0,
    "memberSince" timestamptz NOT NULL DEFAULT now(),
    phone text NULL,
    "activationExpiry" timestamptz NULL,
    "rideRatePerKm" numeric NULL,
    "minFare" numeric NULL,
    "parcelRatePerKm" numeric NULL,
    "hourlyHireRate" numeric NULL,
    "dailyHireRate" numeric NULL,
    "tourRates" jsonb NULL,
    "bankDetails" jsonb NULL,
    "rentalDetails" jsonb NULL,
    bio text NULL,
    "massageStatus" text NULL,
    "massageServices" text[] NULL,
    "massagePricing" jsonb NULL,
    "galleryImages" jsonb NULL,
    amenities jsonb NULL,
    "otherAmenities" text NULL,
    "businessHours" text NULL,
    "location" jsonb NULL,
    description text NULL,
    address text NULL,
    street text NULL,
    photos jsonb NULL,
    "checkInTime" time without time zone NULL,
    "airportPickup" boolean NULL,
    "loyaltyRewardEnabled" boolean NULL,
    "hotelVillaAmenities" jsonb NULL,
    "agentId" uuid NULL,
    "acceptanceRate" numeric NULL,
    "cancellationRate" numeric NULL,
    "privateInfo" jsonb NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT partners_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('partners')}`,
        members: `
-- Table for end-user members
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.members;
CREATE TABLE public.members (
    id uuid NOT NULL PRIMARY KEY,
    "whatsappNumber" text NOT NULL,
    name text NULL,
    email text NOT NULL,
    "lastKnownLocation" text NULL,
    status text NOT NULL DEFAULT 'active'::text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT members_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('members')}`,
        applications: `
-- Table for partner applications
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.applications;
CREATE TABLE public.applications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    "submittedAt" timestamptz NOT NULL DEFAULT now(),
    "partnerType" text NOT NULL,
    documents jsonb NULL,
    vehicle jsonb NULL,
    "prospectId" uuid NULL
);
${rlsAndPolicyTemplate('applications')}`,
        vendor_items: `
-- Table for items sold by vendors
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.vendor_items;
CREATE TABLE public.vendor_items (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "vendorId" uuid NOT NULL,
    name text NOT NULL,
    price numeric NOT NULL,
    "isAvailable" boolean NOT NULL DEFAULT true,
    "imageUrl" text NOT NULL,
    description text NULL,
    "longDescription" text NULL,
    category text NULL,
    "chiliLevel" integer NULL,
    "cookingTime" integer NULL,
    CONSTRAINT vendor_items_vendorId_fkey FOREIGN KEY ("vendorId") REFERENCES public.partners(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('vendor_items')}`,
        transactions: `
-- Table for all financial transactions
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.transactions;
CREATE TABLE public.transactions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" uuid NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    type text NOT NULL,
    amount numeric NOT NULL,
    status text NOT NULL DEFAULT 'in_progress'::text,
    details text NOT NULL,
    breakdown jsonb NULL,
    CONSTRAINT transactions_partnerId_fkey FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON DELETE SET NULL
);
${rlsAndPolicyTemplate('transactions')}`,
        messages: `
-- Table for admin-to-partner messaging
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.messages;
CREATE TABLE public.messages (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "senderId" uuid NULL,
    "recipientId" text NOT NULL,
    content text NOT NULL,
    "sentAt" timestamptz NOT NULL DEFAULT now(),
    "readBy" uuid[] NOT NULL DEFAULT '{}'::uuid[]
);
${rlsAndPolicyTemplate('messages')}`,
        tour_destinations: `
-- Table for tour destinations for Jeep/Car drivers
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.tour_destinations;
CREATE TABLE public.tour_destinations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    "imageUrl" text NULL
);
${rlsAndPolicyTemplate('tour_destinations')}`,
        content_overrides: `
-- Table for CMS content overrides (used for Editable component)
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.content_overrides;
CREATE TABLE public.content_overrides (
    id integer NOT NULL PRIMARY KEY,
    text jsonb,
    numbers jsonb,
    assets jsonb
);
${rlsAndPolicyTemplate('content_overrides')}`,
        renewal_submissions: `
-- Table for membership renewal submissions
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.renewal_submissions;
CREATE TABLE public.renewal_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" uuid NOT NULL,
    "partnerName" text NOT NULL,
    "submittedAt" timestamptz NOT NULL DEFAULT now(),
    "selectedPackage" integer NOT NULL,
    "transactionNumber" text NOT NULL,
    "paymentMethod" text NOT NULL,
    "receiptImage" text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    "amountPaid" numeric NOT NULL,
    "approvedAt" timestamptz NULL,
    CONSTRAINT renewal_submissions_partnerId_fkey FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('renewal_submissions')}`,
        vehicles: `
-- Table for fleet management (Bikes, Jeeps, Cars, etc.)
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.vehicles;
CREATE TABLE public.vehicles (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" uuid NULL,
    type text NOT NULL,
    "serviceType" text NOT NULL,
    driver text NOT NULL,
    "driverImage" text NOT NULL,
    "driverRating" numeric NOT NULL DEFAULT 0,
    name text NOT NULL,
    plate text NOT NULL,
    "isAvailable" boolean NOT NULL DEFAULT true,
    zone text NULL,
    "pricePerKm" numeric NULL,
    "pricePerKmParcel" numeric NULL,
    whatsapp text NULL,
    "modelCc" text NULL,
    color text NULL,
    "registrationYear" integer NULL,
    "pricePerDay" numeric NULL,
    "bankDetails" jsonb NOT NULL,
    seats integer NULL,
    "tourPackages" jsonb NULL,
    "associatedDestinationID" text NULL,
    "operatingHours" text NULL,
    "listingType" text NULL DEFAULT 'rent'::text,
    "salePrice" numeric NULL,
    CONSTRAINT vehicles_partnerId_fkey FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON DELETE SET NULL
);
${rlsAndPolicyTemplate('vehicles')}`,
        rooms: `
-- Table for lodging partner rooms (Hotels, Villas)
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.rooms;
CREATE TABLE public.rooms (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "vendorId" uuid NOT NULL,
    name text NOT NULL,
    "pricePerNight" numeric NOT NULL,
    "mainImage" text NOT NULL,
    thumbnails text[] NOT NULL,
    "isAvailable" boolean NOT NULL DEFAULT true,
    amenities jsonb NOT NULL,
    "specialOffer" jsonb NOT NULL,
    CONSTRAINT rooms_vendorId_fkey FOREIGN KEY ("vendorId") REFERENCES public.partners(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('rooms')}`,
        prospects: `
-- Table for agent prospects
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.prospects;
CREATE TABLE public.prospects (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "agentId" uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text NOT NULL,
    address text NOT NULL,
    street text NOT NULL,
    "partnerType" text NOT NULL,
    "meetingNotes" text NOT NULL,
    "meetingDateTime" timestamptz NOT NULL,
    "callbackDateTime" timestamptz NULL,
    status text NOT NULL DEFAULT 'prospect'::text,
    "createdAt" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT prospects_agentId_fkey FOREIGN KEY ("agentId") REFERENCES public.users(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('prospects')}`,
        agent_applications: `
-- Table for agent applications
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.agent_applications;
CREATE TABLE public.agent_applications (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    email text NOT NULL,
    nik text NOT NULL,
    age integer NOT NULL,
    whatsapp text NOT NULL,
    address text NOT NULL,
    "lastJob" text NOT NULL,
    transport text NOT NULL,
    equipment text[] NOT NULL,
    "shirtSize" text NOT NULL,
    "policeRecord" boolean NOT NULL,
    "idCardImage" text NOT NULL,
    "profilePhotoImage" text NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    "submittedAt" timestamptz NOT NULL DEFAULT now()
);
${rlsAndPolicyTemplate('agent_applications')}`,
        massage_types: `
-- Table for the massage directory
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.massage_types;
CREATE TABLE public.massage_types (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    description text NOT NULL,
    "imageUrl" text NOT NULL,
    category text NOT NULL
);
${rlsAndPolicyTemplate('massage_types')}`,
        seed_massage_types: `
-- This script pre-populates the 'massage_types' table with a standard list of common massages.
-- It is safe to run multiple times as it checks for existing entries before inserting.

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Pijat Tradisional (Urut)', 'A traditional Indonesian deep tissue massage using palm pressure and invigorating strokes to relieve muscle tension and improve circulation.', 'https://placehold.co/300x200/f97316/ffffff?text=Pijat', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Pijat Tradisional (Urut)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Kerokan (Coin Rub)', 'A folk remedy using a coin to scrape the skin, believed to release "wind" from the body and alleviate cold symptoms. Often followed by a balm application.', 'https://placehold.co/300x200/f97316/ffffff?text=Kerokan', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Kerokan (Coin Rub)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Lulur Body Scrub', 'A royal Javanese beauty ritual. A paste of turmeric, rice powder, and spices is applied to exfoliate and soften the skin, followed by a yogurt rub.', 'https://placehold.co/300x200/f97316/ffffff?text=Lulur', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Lulur Body Scrub');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Totok Wajah (Facial Acupressure)', 'A facial treatment that applies pressure to specific points on the face to improve blood flow, reduce tension, and create a natural facelift effect.', 'https://placehold.co/300x200/f97316/ffffff?text=Totok', 'Traditional Indonesian Techniques'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Totok Wajah (Facial Acupressure)');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Balinese Massage', 'A full-body treatment combining gentle stretches, acupressure, and aromatherapy oils to stimulate blood flow and induce deep relaxation.', 'https://placehold.co/300x200/ea580c/ffffff?text=Balinese', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Balinese Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Thai Massage', 'An invigorating and dynamic massage that involves assisted yoga postures and stretching to improve flexibility, reduce tension, and boost energy.', 'https://placehold.co/300x200/ea580c/ffffff?text=Thai', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Thai Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Shiatsu Massage', 'A Japanese finger pressure technique that uses thumbs, fingers, and palms to apply pressure to specific points, promoting energy flow and correcting imbalances.', 'https://placehold.co/300x200/ea580c/ffffff?text=Shiatsu', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Shiatsu Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Lomi Lomi Massage', 'A traditional Hawaiian massage using long, flowing strokes with the forearms and hands, mimicking the rhythm of ocean waves to soothe and heal.', 'https://placehold.co/300x200/ea580c/ffffff?text=Lomi+Lomi', 'Eastern & Indonesian Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Lomi Lomi Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Swedish Massage', 'A classic Western massage using long, gliding strokes, kneading, and friction on the more superficial layers of muscles. Ideal for relaxation.', 'https://placehold.co/300x200/d97706/ffffff?text=Swedish', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Swedish Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Deep Tissue Massage', 'Focuses on realigning deeper layers of muscles and connective tissue. It is especially helpful for chronically tense and contracted areas.', 'https://placehold.co/300x200/d97706/ffffff?text=Deep+Tissue', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Deep Tissue Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Aromatherapy Massage', 'A Swedish massage therapy using essential oils derived from plants to affect your mood and alleviate pain, promoting physical and emotional well-being.', 'https://placehold.co/300x200/d97706/ffffff?text=Aromatherapy', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Aromatherapy Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Hot Stone Massage', 'Heated, smooth stones are placed on key points of the body. The heat relaxes muscles, allowing the therapist to work deeper without intense pressure.', 'https://placehold.co/300x200/d97706/ffffff?text=Hot+Stone', 'Western Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Hot Stone Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Reflexology', 'Applying pressure to specific points on the feet, hands, and ears. These points correspond to different body organs and systems, promoting health in those areas.', 'https://placehold.co/300x200/b45309/ffffff?text=Reflexology', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Reflexology');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Sports Massage', 'Specifically designed for people who are involved in physical activity. It focuses on preventing and treating injury and enhancing athletic performance.', 'https://placehold.co/300x200/b45309/ffffff?text=Sports', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Sports Massage');

INSERT INTO public.massage_types (name, description, "imageUrl", category)
SELECT 'Prenatal Massage', 'A gentle massage tailored for the expectant mother''s needs. It is used to improve circulation, reduce swelling, and relieve muscle and joint pain.', 'https://placehold.co/300x200/b45309/ffffff?text=Prenatal', 'Specialty Massages'
WHERE NOT EXISTS (SELECT 1 FROM public.massage_types WHERE name = 'Prenatal Massage');
`,
        feedback: `
-- Table for customer feedback
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.feedback;
CREATE TABLE public.feedback (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" uuid NOT NULL,
    rating integer NOT NULL,
    comment text NULL,
    date timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT feedback_partnerId_fkey FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('feedback')}`,
        payouts: `
-- Table for partner payouts
-- WARNING: This will drop the existing table and its data.
DROP TABLE IF EXISTS public.payouts;
CREATE TABLE public.payouts (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    "partnerId" uuid NOT NULL,
    date timestamptz NOT NULL DEFAULT now(),
    amount numeric NOT NULL,
    status text NOT NULL DEFAULT 'pending'::text,
    "bankName" text NOT NULL,
    "accountNumberLast4" text NOT NULL,
    CONSTRAINT payouts_partnerId_fkey FOREIGN KEY ("partnerId") REFERENCES public.partners(id) ON DELETE CASCADE
);
${rlsAndPolicyTemplate('payouts')}`
    };

    return (
        <div className="space-y-8">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                <h3 className="font-bold text-blue-800">Database Setup Guide</h3>
                 <p className="text-sm text-blue-700 mt-1">
                    This page provides the necessary SQL scripts to create all tables required for the application. It also includes scripts for seeding initial data (like the massage directory). The scripts now enable Row Level Security (RLS) and apply basic security policies to resolve common setup errors.
                </p>
            </div>
             <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                <h3 className="font-bold text-red-800">Important Security Note</h3>
                <p className="text-sm text-red-700 mt-1">
                    The included policies are designed for development and are intentionally permissive (e.g., allowing any logged-in user to perform actions). <strong>You MUST review and tighten these Row Level Security policies before moving to a production environment.</strong>
                    <br/>
                    <strong>Warning:</strong> These scripts will delete any existing tables with the same name. Always back up your data first.
                </p>
            </div>

            {Object.entries(sqlScripts).map(([key, sql]) => {
                const title = key.replace(/_/g, ' ').replace('seed ', 'Seed Data: ');
                return <SqlCopyBlock key={key} title={title} sql={sql} sqlId={`setup-table-${key}`} />
            })}
        </div>
    );
};

export default DatabaseSetupPage;