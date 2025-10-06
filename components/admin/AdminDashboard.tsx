import React, { useState, useEffect, useCallback, useMemo } from 'react';
import * as api from '../../services/supabase';
import { User, PartnerApplication, AdminStats, Role, PartnerType, Partner } from '../../types';
import Layout from '../shared/Layout';
import StatCard from './StatCard';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import PartnerDetails from './PartnerDetails';
import FinancialsPage from './FinancialsPage';
import AnalyticsPage from './AnalyticsPage';
import BroadcastMessageModal from './BroadcastMessageModal';
import TourManagementPage from './TourManagementPage';
import SiteContentPage from './SiteContentPage';
import RenewalManagementPage from './RenewalManagementPage';
import FleetManagement from './BikeFleetManagement';
import MassageManagementPage from './MassageManagementPage';
import MemberManagementPage from './MemberManagementPage';
import AgentManagementPage from './AgentManagementPage';
import AgentApplicationManagementPage from './AgentApplicationManagementPage';
import { Editable } from '../shared/Editable';
import MassagePartnerDetails from './MassagePartnerDetails';
import MassageDirectoryManagementPage from './MassageDirectoryManagementPage';
import FoodDirectoryManagementPage from './FoodDirectoryManagementPage';
import SupabaseStatusPage from './SupabaseStatusPage';
import DatabaseSetupPage from './DatabaseSetupPage';
import { 
  UserGroupIcon, DocumentTextIcon, CheckCircleIcon, StoreIcon, SearchIcon,
  CarIcon, MotorcycleIcon, FoodIcon, ShoppingBagIcon, KeyIcon, BriefcaseIcon, ChevronRightIcon,
  BanknotesIcon, SparklesIcon, LandmarkIcon, RealCarIcon, IdCardIcon, ExclamationCircleIcon, ClipboardListIcon, ServerIcon
} from '../shared/Icons';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

type AdminView = 'applications' | 'partners' | 'agents' | 'members' | 'financials' | 'analytics' | 'tours' | 'siteContent' | 'renewals' | 'fleet' | 'massage' | 'massageDirectory' | 'agentApplications' | 'foodDirectory' | 'supabaseStatus' | 'databaseSetup';

const partnerTypeConfig: Record<PartnerType, { icon: React.ReactNode }> = {
  [PartnerType.BikeDriver]: { icon: <MotorcycleIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.CarDriver]: { icon: <CarIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.LorryDriver]: { icon: <CarIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.FoodVendor]: { icon: <FoodIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.StreetShop]: { icon: <ShoppingBagIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.CarRental]: { icon: <KeyIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.BikeRental]: { icon: <KeyIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.LocalBusiness]: { icon: <BriefcaseIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.MassageTherapist]: { icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.MassagePlace]: { icon: <SparklesIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.Hotel]: { icon: <LandmarkIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.Villa]: { icon: <LandmarkIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.JeepTourOperator]: { icon: <RealCarIcon className="w-5 h-5 mr-2" /> },
  // Fix: Add missing BusRental partner type to resolve TypeScript error.
  [PartnerType.BusRental]: { icon: <RealCarIcon className="w-5 h-5 mr-2" /> },
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const isMaintenanceMode = user.isMaintenanceMode;
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(!isMaintenanceMode);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState<PartnerType>(PartnerType.BikeDriver);
  const [view, setView] = useState<AdminView>(isMaintenanceMode ? 'databaseSetup' : 'applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (isMaintenanceMode) return;
    setLoading(true);
    setError(null);
    try {
        const [statsRes, appsRes, partnersRes] = await Promise.all([
            api.getAdminStats(),
            api.getApplications(),
            api.getPartners(),
        ]);
        setStats(statsRes);
        setApplications(appsRes);
        setPartners(partnersRes);
    } catch (err: any) {
        console.error("Failed to fetch admin data:", err);
        setError(err.message || 'An unknown error occurred while fetching dashboard data.');
    } finally {
        setLoading(false);
    }
  }, [isMaintenanceMode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    try {
        await api.updateApplication(id, status);
        await fetchData(); 
    } catch (error) {
        console.error(`Failed to update application ${id}:`, error);
        // Show an error message to the user
    } finally {
        setSelectedApp(null);
        setActionLoading(false);
    }
  };
  
  const handleViewChange = (newView: AdminView) => {
    setSelectedPartner(null);
    setView(newView);
  }

  const handleBackAndRefresh = () => {
    setSelectedPartner(null);
    fetchData();
  };

  const filteredApplications = applications.filter(app => app.partnerType === activeAppTab && app.status === 'pending');
  
  const filteredPartners = useMemo(() => {
    return partners.filter(partner =>
      (partner.profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       partner.partnerType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [partners, searchTerm]);

  const statusBadge = (status: 'active' | 'pending' | 'suspended' | 'approved' | 'rejected') => {
    const statusClasses: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        active: 'bg-green-100 text-green-800',
        suspended: 'bg-gray-100 text-gray-800',
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
  };
  
  const getTitle = () => {
    if (selectedPartner) return 'Partner Details';
    if (isMaintenanceMode) {
        if (view === 'databaseSetup') return 'Database Setup Guide';
        if (view === 'supabaseStatus') return 'Supabase Integration Status';
        return 'Setup & Recovery Mode';
    }
    switch(view) {
        case 'applications': return 'Partner Application Management';
        case 'agentApplications': return 'Agent Application Management';
        case 'partners': return 'Partner Directory';
        case 'agents': return 'Agent Management';
        case 'members': return 'Member Management';
        case 'fleet': return 'Fleet Management';
        case 'foodDirectory': return 'Food Directory Management';
        case 'massage': return 'Massage & Wellness Management';
        case 'massageDirectory': return 'Massage Directory Management';
        case 'renewals': return 'Membership Renewals';
        case 'financials': return 'Financial Overview';
        case 'analytics': return 'Business Analytics';
        case 'tours': return 'Tour Destination Management';
        case 'siteContent': return 'Site Content Management';
        case 'supabaseStatus': return 'Supabase Integration Status';
        case 'databaseSetup': return 'Database Setup Guide';
        default: return 'Admin Dashboard';
    }
  };

  const renderContent = () => {
    if (loading) {
        return <div className="text-center p-10">Loading dashboard...</div>;
    }
    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error Loading Data</h3>
                        <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap font-mono">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (selectedPartner) {
        const isMassagePartner = selectedPartner.partnerType === PartnerType.MassageTherapist || selectedPartner.partnerType === PartnerType.MassagePlace;
        if (isMassagePartner) {
            return <MassagePartnerDetails partner={selectedPartner} onBack={handleBackAndRefresh} />;
        }
        return <PartnerDetails partner={selectedPartner} onBack={handleBackAndRefresh} />;
    }
    switch (view) {
        case 'agentApplications':
            return <AgentApplicationManagementPage />;
        case 'fleet':
            return <FleetManagement />;
        case 'foodDirectory':
            return <FoodDirectoryManagementPage />;
        case 'massage':
            return <MassageManagementPage onPartnerSelect={setSelectedPartner} />;
        case 'massageDirectory':
            return <MassageDirectoryManagementPage />;
        case 'renewals':
            return <RenewalManagementPage onPartnerSelect={setSelectedPartner}/>;
        case 'financials':
            return <FinancialsPage />;
        case 'analytics':
            return <AnalyticsPage />;
        case 'tours':
            return <TourManagementPage />;
        case 'siteContent':
            return <SiteContentPage />;
        case 'supabaseStatus':
            return <SupabaseStatusPage />;
        case 'databaseSetup':
            return <DatabaseSetupPage />;
        case 'members':
            return <MemberManagementPage user={user} />;
        case 'agents':
            return <AgentManagementPage />;
        case 'applications':
        case 'partners':
        default:
            return (
                 <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <StatCard title="Total Partners" value={stats?.totalPartners ?? '...'} icon={<UserGroupIcon className="w-6 h-6"/>} />
                    <StatCard title="Pending Partner Apps" value={stats?.pendingApplications ?? '...'} icon={<DocumentTextIcon className="w-6 h-6"/>} />
                    <StatCard title="Pending Agent Apps" value={stats?.pendingAgentApplications ?? '...'} icon={<IdCardIcon className="w-6 h-6"/>} />
                    <StatCard title="Agent Partner Signups" value={stats?.pendingAgentSignups ?? '...'} icon={<BriefcaseIcon className="w-6 h-6"/>} />
                    <StatCard title="Pending Renewals" value={stats?.pendingRenewals ?? '...'} icon={<BanknotesIcon className="w-6 h-6"/>} />
                    <StatCard title="Active Partners" value={(stats?.activeDrivers ?? 0) + (stats?.activeVendorsAndBusinesses ?? 0)} icon={<CheckCircleIcon className="w-6 h-6"/>} />
                  </div>

                  {/* Development Priorities Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Top Priority Panel */}
                    <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6 shadow-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-green-800">Authentication Complete</h3>
                          <div className="mt-2 text-sm text-green-700">
                            <p>
                              The application is now fully integrated with Supabase Authentication, replacing the previous mock login system.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Next Steps Panel */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6 shadow-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <ClipboardListIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-bold text-blue-800">Architectural Upgrades</h3>
                          <div className="mt-2 text-sm text-blue-700">
                            <ul className="list-disc pl-5 space-y-2">
                              <li>
                                Image handling has been migrated from base64 strings to Supabase Storage for better performance and scalability.
                              </li>
                              <li>
                                All polling mechanisms have been replaced with Supabase Realtime for instant data updates.
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Main Content Area */}
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-4 sm:p-6 border-b">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-800">Partner Management</h3>
                            <p className="text-sm text-gray-500 mt-1">Review applications or manage existing partners.</p>
                          </div>
                          <div className="flex mt-4 sm:mt-0 rounded-md shadow-sm">
                              <button onClick={() => setView('applications')} className={`px-4 py-2 text-sm font-medium border ${view === 'applications' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-l-md focus:z-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}>
                                  Applications
                              </button>
                              <button onClick={() => setView('partners')} className={`px-4 py-2 text-sm font-medium border ${view === 'partners' ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-r-md focus:z-10 focus:ring-2 focus:ring-orange-500 focus:border-orange-500`}>
                                  Partners
                              </button>
                          </div>
                        </div>
                    </div>
                    
                    {view === 'applications' && (
                      <div>
                        {/* Application Tabs */}
                        <div className="border-b border-gray-200">
                          <nav className="-mb-px flex flex-wrap" aria-label="Tabs">
                            {Object.values(PartnerType).map((type) => (
                              <button
                                key={type}
                                onClick={() => setActiveAppTab(type)}
                                className={`${
                                  activeAppTab === type
                                    ? 'border-orange-500 text-orange-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                              >
                                {partnerTypeConfig[type as PartnerType].icon}
                                {type}
                              </button>
                            ))}
                          </nav>
                        </div>
                        {/* Applications Table */}
                        <div className="overflow-x-auto">
                          
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant Name</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Submitted At</th>
                                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {filteredApplications.length > 0 ? filteredApplications.map((app) => (
                                  <tr key={app.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.name}</div>
                                        <div className="text-sm text-gray-500">{app.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-sm text-gray-500">{new Date(app.submittedAt).toLocaleString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(app.status)}`}>{app.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setSelectedApp(app)} className="text-orange-600 hover:text-orange-900">View Details</button></td>
                                  </tr>
                                )) : <tr><td colSpan={4} className="text-center py-10 px-6 text-gray-500">No pending applications in this category.</td></tr>}
                              </tbody>
                            </table>
                          
                        </div>
                      </div>
                    )}

                    {view === 'partners' && (
                      <div>
                        <div className="p-4 border-b flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="relative w-full sm:w-auto flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SearchIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              placeholder="Search by name, email, or type..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            />
                          </div>
                          <button 
                            onClick={() => setIsBroadcastModalOpen(true)}
                            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Broadcast Message
                          </button>
                        </div>
                         <div className="overflow-x-auto">
                          
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Rating</th>
                                  <th className="relative px-6 py-3"><span className="sr-only">Details</span></th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                 {filteredPartners.length > 0 ? filteredPartners.map((partner) => (
                                  <tr key={partner.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPartner(partner)}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 rounded-full" src={partner.profile.profilePicture || `https://ui-avatars.com/api/?name=${partner.profile.name}&background=random`} alt="" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{partner.profile.name || partner.profile.shopName}</div>
                                                <div className="text-sm text-gray-500">{partner.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{partner.partnerType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge(partner.status)}`}>{partner.status}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">{partner.rating.toFixed(1)} ★</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right"><ChevronRightIcon className="w-5 h-5 text-gray-400" /></td>
                                  </tr>
                                )) : <tr><td colSpan={5} className="text-center py-10 px-6 text-gray-500">No partners found.</td></tr>}
                              </tbody>
                            </table>
                          
                        </div>
                      </div>
                    )}
                  </div>
                </>
            );
    }
  }

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      title={getTitle()}
      currentView={view}
      onViewChange={handleViewChange as (view: string) => void}
    >
      {isMaintenanceMode && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-r-lg">
              <p className="font-bold">You are in Setup & Recovery Mode.</p>
              <p className="text-sm">The application's database is not correctly configured. Use the tools below to diagnose and fix the issues. Once your database is set up, log out and sign in with your real admin account.</p>
          </div>
      )}
      {renderContent()}
      <ApplicationDetailsModal 
        application={selectedApp}
        onClose={() => setSelectedApp(null)}
        onApprove={(id) => handleUpdateStatus(id, 'approved')}
        onReject={(id) => handleUpdateStatus(id, 'rejected')}
        loading={actionLoading}
      />
      {isBroadcastModalOpen && <BroadcastMessageModal onClose={() => setIsBroadcastModalOpen(false)} />}
    </Layout>
  );
};

export default AdminDashboard;