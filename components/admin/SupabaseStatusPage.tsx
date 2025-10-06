import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ClockIcon } from '../shared/Icons';
import SqlCopyBlock from '../shared/SqlCopyBlock';

type Status = 'idle' | 'testing' | 'success' | 'error';
interface StatusState {
  status: Status;
  message: string;
  sql?: string;
}

const TEST_TABLE_NAME = 'supabase_status_test';
const TEST_BUCKET_NAME = 'supabase-status-test-bucket';
const TEST_CHANNEL_NAME = 'supabase-status-test-channel';
const PROJECT_REF = 'ovfhgfzdlwgjtzsfsgzf'; // Manually extracted from services/supabase.ts


const StatusIndicator: React.FC<{ status: Status; message: string; }> = ({ status, message }) => {
    const baseClasses = "text-sm p-3 rounded-md flex items-start";
    const statusConfig = {
        idle: { icon: <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />, classes: "bg-gray-100 text-gray-700" },
        testing: { icon: <ClockIcon className="w-5 h-5 mr-2 animate-spin flex-shrink-0" />, classes: "bg-blue-100 text-blue-800" },
        success: { icon: <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />, classes: "bg-green-100 text-green-800" },
        error: { icon: <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />, classes: "bg-red-100 text-red-800" },
    };
    const { icon, classes } = statusConfig[status];
    return (
        <div className={`${baseClasses} ${classes}`}>
            {icon}
            <span className="flex-1 break-words whitespace-pre-wrap font-mono">{message}</span>
        </div>
    );
};

const TestPanel: React.FC<{ title: string; children: React.ReactNode; onRunTest: () => void; statusState: StatusState; }> = ({ title, children, onRunTest, statusState }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{children}</div>
        <StatusIndicator {...statusState} />
        {statusState.sql && (
            <div className="mt-4">
                <SqlCopyBlock title="Required Setup SQL" sql={statusState.sql} sqlId={`${title}-setup-sql`} />
            </div>
        )}
        <button onClick={onRunTest} disabled={statusState.status === 'testing'} className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:bg-orange-300">
            Run Test
        </button>
    </div>
);

const InfoPanel: React.FC<{ title: string; children: React.ReactNode; link: string; }> = ({ title, children, link }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{children}</div>
        <a href={link} target="_blank" rel="noopener noreferrer" className="mt-4 block w-full text-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700">
            View in Supabase Dashboard
        </a>
    </div>
);

const SupabaseStatusPage: React.FC = () => {
    const [authState, setAuthState] = useState<StatusState>({ status: 'idle', message: 'Ready to test authentication.' });
    const [dbState, setDbState] = useState<StatusState>({ status: 'idle', message: 'Ready to test database CRUD.' });
    const [storageState, setStorageState] = useState<StatusState>({ status: 'idle', message: 'Ready to test storage operations.' });
    const [realtimeState, setRealtimeState] = useState<StatusState>({ status: 'idle', message: 'Ready to test realtime connection.' });
    
    const [schemaState, setSchemaState] = useState<StatusState>({ status: 'idle', message: 'Ready to check database schema.' });
    const [schemaResults, setSchemaResults] = useState<Array<{ name: string; status: 'found' | 'missing'; error?: string }>>([]);

    
    // --- Test Functions ---

    const testAuth = async () => {
        setAuthState({ status: 'testing', message: 'Checking session...' });
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            if (session) {
                setAuthState({ status: 'success', message: `Successfully authenticated as ${session.user.email}.` });
            } else {
                throw new Error("No active Supabase session found. User is not logged in via Supabase Auth.");
            }
        } catch (e: any) {
            setAuthState({ status: 'error', message: e.message });
        }
    };

    const testDatabase = async () => {
        setDbState({ status: 'testing', message: 'Performing CRUD operations...', sql: undefined });
        let testId: string | number = '';
        try {
            // 1. Create
            const { data: createData, error: createError } = await supabase.from(TEST_TABLE_NAME).insert({ test_col: 'hello' }).select().single();
            if (createError) {
                if (createError.code === '42P01') {
                    const setupSql = `
-- 1. Create the test table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.supabase_status_test (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  test_col text
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.supabase_status_test ENABLE ROW LEVEL SECURITY;

-- 3. Create/update policies to allow access for authenticated users
DROP POLICY IF EXISTS "Allow authenticated full access" ON public.supabase_status_test;
CREATE POLICY "Allow authenticated full access"
ON public.supabase_status_test
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
                    `;
                    setDbState({
                        status: 'error',
                        message: `The test table '${TEST_TABLE_NAME}' is missing. Please run the SQL below in your Supabase Editor to create it and set its access policies.`,
                        sql: setupSql.trim()
                    });
                    return;
                }
                throw new Error(`Create failed: ${createError.message}. Ensure RLS is enabled on '${TEST_TABLE_NAME}' and allows inserts for authenticated users.`);
            }
            testId = createData.id;

            // 2. Read
            const { error: readError } = await supabase.from(TEST_TABLE_NAME).select('*').eq('id', testId).single();
            if (readError) throw new Error(`Read failed: ${readError.message}. Ensure RLS allows select.`);
            
            // 3. Update
            const { error: updateError } = await supabase.from(TEST_TABLE_NAME).update({ test_col: 'world' }).eq('id', testId);
            if (updateError) throw new Error(`Update failed: ${updateError.message}. Ensure RLS allows update.`);

            // 4. Delete
            const { error: deleteError } = await supabase.from(TEST_TABLE_NAME).delete().eq('id', testId);
            if (deleteError) throw new Error(`Delete failed: ${deleteError.message}. Ensure RLS allows delete.`);

            setDbState({ status: 'success', message: 'Create, Read, Update, and Delete operations were successful.', sql: undefined });
        } catch (e: any) {
            setDbState({ status: 'error', message: e.message, sql: undefined });
        }
    };
    
    const testStorage = async () => {
        setStorageState({ status: 'testing', message: 'Testing file storage...' });
        const fileName = `test-${Date.now()}.txt`;
        const fileContent = 'Hello, Supabase Storage!';
        const blob = new Blob([fileContent], { type: 'text/plain' });

        try {
            // 1. Upload
            const { error: uploadError } = await supabase.storage.from(TEST_BUCKET_NAME).upload(fileName, blob);
            if (uploadError) {
                if (uploadError.message === 'Bucket not found') {
                    throw new Error(`Upload failed: Bucket not found. Please run the 'Storage Bucket Setup' script on this page to create all required buckets.`);
                }
                if (uploadError.message.includes('violates row-level security policy')) {
                    throw new Error(`Upload failed: RLS Policy Violation. This is almost always caused by a missing 'WITH CHECK' clause in your storage policies. Please copy the latest 'Storage Bucket Setup' script from this page and run it in your Supabase SQL Editor to fix the policies.`);
                }
                throw new Error(`Upload failed: ${uploadError.message}. Check bucket policies for inserts.`);
            }
            
            // 2. Download
            const { data: downloadData, error: downloadError } = await supabase.storage.from(TEST_BUCKET_NAME).download(fileName);
            if (downloadError) throw new Error(`Download failed: ${downloadError.message}. Check bucket policies for select.`);
            if ((await downloadData?.text()) !== fileContent) throw new Error("Downloaded file content does not match uploaded content.");
            
            // 3. Remove
            const { error: removeError } = await supabase.storage.from(TEST_BUCKET_NAME).remove([fileName]);
            if (removeError) throw new Error(`Remove failed: ${removeError.message}. Check bucket policies for deletes.`);
            
            setStorageState({ status: 'success', message: 'File Upload, Download, and Delete successful.' });
        } catch (e: any) {
            setStorageState({ status: 'error', message: e.message });
        }
    };
    
    const testRealtime = async () => {
        setRealtimeState({ status: 'testing', message: 'Setting up Realtime listener...' });

        let channel: RealtimeChannel | null = null;
        let testId: number | null = null;

        // Helper to unsubscribe and delete test data
        const cleanup = async () => {
            if (channel) {
                // supabase.removeChannel returns a promise that resolves when channel is removed
                await supabase.removeChannel(channel);
            }
            if (testId) {
                // Delete the test row
                await supabase.from(TEST_TABLE_NAME).delete().eq('id', testId);
            }
        };

        const timeout = setTimeout(async () => {
            setRealtimeState({
                status: 'error',
                message: `Test timed out after 10 seconds. Could not receive database change notification.
Possible causes:
1. Realtime is not enabled for this project. Go to Dashboard > Database > Realtime to enable it.
2. The '${TEST_TABLE_NAME}' table is not enabled for Realtime events. In the same Realtime section, make sure the table is enabled.
3. RLS policy on '${TEST_TABLE_NAME}' does not allow SELECT for authenticated users. The policy needs to be permissive for the test to pass.
4. A network issue (like a firewall) is blocking WebSocket connections.`
            });
            await cleanup();
        }, 10000); // 10s timeout

        try {
            channel = supabase.channel(TEST_CHANNEL_NAME)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: TEST_TABLE_NAME
                }, async (payload) => {
                    // Check if the received payload is for our specific test insert
                    if (payload.new.id === testId) {
                        clearTimeout(timeout);
                        setRealtimeState({
                            status: 'success',
                            message: `Successfully received database change notification for new record ID ${testId}.`
                        });
                        await cleanup();
                    }
                })
                .subscribe(async (status, err) => {
                    if (status === 'SUBSCRIBED') {
                        setRealtimeState({ status: 'testing', message: 'Listener active. Inserting test record...' });
                        
                        const { data, error } = await supabase
                            .from(TEST_TABLE_NAME)
                            .insert({ test_col: 'realtime_test' })
                            .select()
                            .single();
                        
                        if (error) {
                            clearTimeout(timeout);
                            let finalMessage = `Failed to insert test record: ${error.message}. Check RLS policies for INSERT on '${TEST_TABLE_NAME}'.`;
                            if (error.code === '42P01') { // undefined_table
                                finalMessage = `Realtime test failed because the test table '${TEST_TABLE_NAME}' is missing. Please run the "Database" test first. It will provide the necessary SQL to create the table.`;
                            }
                            setRealtimeState({ status: 'error', message: finalMessage });
                            await cleanup();
                        } else {
                            testId = data.id;
                            setRealtimeState({ status: 'testing', message: `Record ${testId} inserted. Waiting for notification...` });
                        }
                    }
                    if (status === 'TIMED_OUT' || status === 'CHANNEL_ERROR' || err) {
                        clearTimeout(timeout);
                        const errorMessage = err ? err.message : status;
                        setRealtimeState({ status: 'error', message: `Subscription failed: ${errorMessage}. Please check your project's Realtime settings.` });
                        await cleanup();
                    }
                });
        } catch (e: any) {
            clearTimeout(timeout);
            setRealtimeState({ status: 'error', message: `An unexpected error occurred during setup: ${e.message}` });
            await cleanup();
        }
    };


    const testSchema = async () => {
        setSchemaState({ status: 'testing', message: 'Checking all required tables...' });
        setSchemaResults([]);
        
        const requiredTables = [
            'users', 'partners', 'members', 'applications', 'vendor_items',
            'transactions', 'messages', 'tour_destinations', 'content_overrides',
            'renewal_submissions', 'vehicles', 'rooms', 'prospects',
            'agent_applications', 'massage_types', 'feedback', 'payouts'
        ];

        const results: Array<{ name: string; status: 'found' | 'missing'; error?: string }> = [];
        let missingCount = 0;

        for (const tableName of requiredTables) {
            // A lightweight query to check for existence.
            const { error } = await supabase.from(tableName).select('id', { head: true, count: 'exact' });

            if (error && error.code === '42P01') { // undefined_table
                results.push({ name: tableName, status: 'missing', error: 'Table not found.' });
                missingCount++;
            } else if (error) {
                // Other errors might indicate RLS issues preventing even a head request.
                 results.push({ name: tableName, status: 'missing', error: `Error: ${error.message}` });
                 missingCount++;
            } else {
                results.push({ name: tableName, status: 'found' });
            }
        }
        
        setSchemaResults(results.sort((a, b) => a.name.localeCompare(b.name)));

        if (missingCount > 0) {
            setSchemaState({ status: 'error', message: `${missingCount} out of ${requiredTables.length} tables are missing or have errors. See details below.` });
        } else {
            setSchemaState({ status: 'success', message: `All ${requiredTables.length} required tables are present.` });
        }
    };
    
    const storageSetupSql = `
-- This script creates all required storage buckets and sets their access policies.
-- It is idempotent, meaning it can be run multiple times safely.
-- This version explicitly checks for bucket existence before inserting to prevent any errors.

-- --- BUCKET: items ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'items') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('items', 'items', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Public Read on items" ON storage.objects;
CREATE POLICY "Public Read on items" ON storage.objects FOR SELECT USING (bucket_id = 'items');
DROP POLICY IF EXISTS "Authenticated write access on items" ON storage.objects;
CREATE POLICY "Authenticated write access on items" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'items') WITH CHECK (bucket_id = 'items');

-- --- BUCKET: receipts ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'receipts') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Public Read on receipts" ON storage.objects;
CREATE POLICY "Public Read on receipts" ON storage.objects FOR SELECT USING (bucket_id = 'receipts');
DROP POLICY IF EXISTS "Authenticated write access on receipts" ON storage.objects;
CREATE POLICY "Authenticated write access on receipts" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'receipts') WITH CHECK (bucket_id = 'receipts');

-- --- BUCKET: documents ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'documents') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Public Read on documents" ON storage.objects;
CREATE POLICY "Public Read on documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents');
DROP POLICY IF EXISTS "Authenticated write access on documents" ON storage.objects;
CREATE POLICY "Authenticated write access on documents" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'documents') WITH CHECK (bucket_id = 'documents');

-- --- BUCKET: avatars ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Public Read on avatars" ON storage.objects;
CREATE POLICY "Public Read on avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Authenticated write access on avatars" ON storage.objects;
CREATE POLICY "Authenticated write access on avatars" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');

-- --- BUCKET: public-images ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'public-images') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('public-images', 'public-images', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Public Read on public-images" ON storage.objects;
CREATE POLICY "Public Read on public-images" ON storage.objects FOR SELECT USING (bucket_id = 'public-images');
DROP POLICY IF EXISTS "Authenticated write access on public-images" ON storage.objects;
CREATE POLICY "Authenticated write access on public-images" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'public-images') WITH CHECK (bucket_id = 'public-images');

-- --- BUCKET: supabase-status-test-bucket ---
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'supabase-status-test-bucket') THEN
    INSERT INTO storage.buckets (id, name, public) VALUES ('supabase-status-test-bucket', 'supabase-status-test-bucket', true);
  END IF;
END $$;
DROP POLICY IF EXISTS "Authenticated write access on test bucket" ON storage.objects;
CREATE POLICY "Authenticated write access on test bucket" ON storage.objects FOR ALL TO authenticated USING (bucket_id = 'supabase-status-test-bucket') WITH CHECK (bucket_id = 'supabase-status-test-bucket');
    `;

    return (
        <div className="space-y-8">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                <p className="font-bold">This page performs live tests against your Supabase project.</p>
                <p className="text-sm">Run each test to verify that your front-end is correctly configured to communicate with each Supabase service.</p>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800">Storage Bucket Setup</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">
                    The application requires several storage buckets for handling file uploads like images and documents. Run the following SQL script in your Supabase SQL Editor to create all necessary buckets and their security policies.
                </p>
                <SqlCopyBlock title="Create All Storage Buckets" sql={storageSetupSql} sqlId="status-storage-setup" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800">Database Schema Validator</h3>
                    <p className="text-sm text-gray-600 mt-1 mb-4">
                        Checks for the existence of all 17 tables required by the application. If a table is missing, use the "Database Setup" page to create it.
                    </p>
                    <StatusIndicator {...schemaState} />
                    <button onClick={testSchema} disabled={schemaState.status === 'testing'} className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md hover:bg-orange-600 disabled:bg-orange-300">
                        Run Schema Check
                    </button>
                    {schemaResults.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                             <h4 className="text-md font-semibold text-gray-700 mb-2">Results:</h4>
                            <div className="max-h-64 overflow-y-auto bg-gray-50 p-2 rounded-md border">
                                 <ul className="divide-y divide-gray-200">
                                    {schemaResults.map(result => (
                                        <li key={result.name} className="py-2 px-2 flex justify-between items-center text-sm">
                                            <span className="font-mono text-gray-700">{result.name}</span>
                                            {result.status === 'found' ? (
                                                <span className="flex items-center font-semibold text-green-600">
                                                    <CheckCircleIcon className="w-5 h-5 mr-1" /> Found
                                                </span>
                                            ) : (
                                                <span className="flex items-center font-semibold text-red-600" title={result.error}>
                                                    <ExclamationCircleIcon className="w-5 h-5 mr-1" /> Missing
                                                </span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <TestPanel title="Authentication" onRunTest={testAuth} statusState={authState}>
                    This test verifies if there is a real, active user session from Supabase Auth. A successful test confirms your Supabase URL and Anon Key are correct and that a user is logged in.
                </TestPanel>

                <TestPanel title="Database" onRunTest={testDatabase} statusState={dbState}>
                    <p>Performs a full Create, Read, Update, Delete (CRUD) cycle on a test table.</p>
                    <div className="mt-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <strong>Setup Required:</strong> This test uses a table named <code>{TEST_TABLE_NAME}</code>. If the test fails because the table is missing, the SQL to create it will appear below.
                    </div>
                </TestPanel>

                 <TestPanel title="Storage" onRunTest={testStorage} statusState={storageState}>
                    <p>Uploads, downloads, and then deletes a small test file from a storage bucket.</p>
                    <div className="mt-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                         <strong>Setup Required:</strong> This test requires a bucket named <code>{TEST_BUCKET_NAME}</code>. If it doesn't exist, run the "Storage Bucket Setup" script at the top of this page.
                    </div>
                </TestPanel>

                <TestPanel title="Realtime" onRunTest={testRealtime} statusState={realtimeState}>
                    Subscribes to database changes, inserts a record, and waits to receive the notification. This confirms your Realtime connection and that policies are not blocking communication.
                </TestPanel>

                <InfoPanel title="Edge Functions" link={`https://supabase.com/dashboard/project/${PROJECT_REF}/functions`}>
                    Edge Functions can only be invoked, not tested for functionality from the client. Check your function logs in the Supabase Dashboard to see if they are being called correctly and running without errors.
                </InfoPanel>
                
                 <InfoPanel title="Logs & Advisors" link={`https://supabase.com/dashboard/project/${PROJECT_REF}/logs/explorer`}>
                    Review your project's API and PostgREST logs for any errors. Also, check the "Security Advisor" and other reports in your dashboard for performance and security recommendations.
                </InfoPanel>
            </div>
        </div>
    );
};

export default SupabaseStatusPage;