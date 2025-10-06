import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, ClockIcon } from '../shared/Icons';

type Status = 'idle' | 'testing' | 'success' | 'error';
interface StatusState {
  status: Status;
  message: string;
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
            <span className="flex-1 break-words">{message}</span>
        </div>
    );
};

const TestPanel: React.FC<{ title: string; children: React.ReactNode; onRunTest: () => void; statusState: StatusState; }> = ({ title, children, onRunTest, statusState }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <div className="text-sm text-gray-600 mt-1 mb-4 flex-grow">{children}</div>
        <StatusIndicator {...statusState} />
        <button onClick={onRunTest} disabled={statusState.status === 'testing'} className="mt-4 w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300">
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
        setDbState({ status: 'testing', message: 'Performing CRUD operations...' });
        let testId: string | number = '';
        try {
            // 1. Create
            const { data: createData, error: createError } = await supabase.from(TEST_TABLE_NAME).insert({ test_col: 'hello' }).select().single();
            if (createError) throw new Error(`Create failed: ${createError.message}. Ensure RLS is enabled on '${TEST_TABLE_NAME}' and allows inserts for authenticated users.`);
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

            setDbState({ status: 'success', message: 'Create, Read, Update, and Delete operations were successful.' });
        } catch (e: any) {
            setDbState({ status: 'error', message: e.message });
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
            if (uploadError) throw new Error(`Upload failed: ${uploadError.message}. Check bucket policies for inserts.`);
            
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
    
    const testRealtime = () => {
        setRealtimeState({ status: 'testing', message: 'Subscribing to test channel...' });
        const channel: RealtimeChannel = supabase.channel(TEST_CHANNEL_NAME);
        
        const timeout = setTimeout(() => {
            setRealtimeState({ status: 'error', message: 'Test timed out. No message received. Check RLS policies for the table if using table subscriptions, or check if Realtime is enabled for your project.' });
            channel.unsubscribe();
        }, 5000);

        channel.on('broadcast', { event: 'test-event' }, ({ payload }) => {
            clearTimeout(timeout);
            setRealtimeState({ status: 'success', message: `Received broadcast message: "${payload.message}"` });
            channel.unsubscribe();
        });

        channel.subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                setRealtimeState({ status: 'testing', message: 'Subscription successful. Sending message...' });
                channel.send({ type: 'broadcast', event: 'test-event', payload: { message: 'hello realtime' } });
            }
            if (status === 'CHANNEL_ERROR' || err) {
                clearTimeout(timeout);
                setRealtimeState({ status: 'error', message: `Subscription failed: ${err?.message}` });
                channel.unsubscribe();
            }
        });
    };

    return (
        <div className="space-y-8">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-500 text-blue-800 rounded-r-lg">
                <p className="font-bold">This page performs live tests against your Supabase project.</p>
                <p className="text-sm">Run each test to verify that your front-end is correctly configured to communicate with each Supabase service.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TestPanel title="Authentication" onRunTest={testAuth} statusState={authState}>
                    This test verifies if there is a real, active user session from Supabase Auth. A successful test confirms your Supabase URL and Anon Key are correct and that a user is logged in.
                </TestPanel>

                <TestPanel title="Database" onRunTest={testDatabase} statusState={dbState}>
                    <p>Performs a full Create, Read, Update, Delete (CRUD) cycle on a test table.</p>
                    <div className="mt-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <strong>Setup Required:</strong> In your Supabase project, create a table named <code>{TEST_TABLE_NAME}</code> with a text column named <code>test_col</code> and enable Row Level Security (RLS) with policies that allow authenticated users to perform all actions (select, insert, update, delete).
                    </div>
                </TestPanel>

                 <TestPanel title="Storage" onRunTest={testStorage} statusState={storageState}>
                    <p>Uploads, downloads, and then deletes a small test file from a storage bucket.</p>
                    <div className="mt-2 text-xs p-2 bg-yellow-50 border border-yellow-200 rounded">
                         <strong>Setup Required:</strong> In Supabase Storage, create a public bucket named <code>{TEST_BUCKET_NAME}</code> and set up policies that allow authenticated users to perform select, insert, update, and delete operations.
                    </div>
                </TestPanel>

                <TestPanel title="Realtime" onRunTest={testRealtime} statusState={realtimeState}>
                    Subscribes to a broadcast channel, sends a message, and waits for the echo. This confirms your Realtime connection and that policies are not blocking communication.
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