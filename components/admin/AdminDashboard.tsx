import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../services/supabase';
import { User, PartnerApplication, AdminStats, Role, PartnerType, Partner } from '../../types';
import Layout from '../shared/Layout';
import StatCard from './StatCard';
import ApplicationDetailsModal from './ApplicationDetailsModal';
import PartnerDetails from './PartnerDetails';
import FinancialsPage from './FinancialsPage';
import AnalyticsPage from './AnalyticsPage';
import BroadcastMessageModal from './BroadcastMessageModal';
import TourManagementPage from './TourManagementPage';
import { 
  UserGroupIcon, DocumentTextIcon, CheckCircleIcon, StoreIcon, SearchIcon,
  CarIcon, MotorcycleIcon, FoodIcon, ShoppingBagIcon, KeyIcon, BriefcaseIcon, ChevronRightIcon
} from '../shared/Icons';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  onSwitchRole: (role: Role) => void;
}

type AdminView = 'applications' | 'partners' | 'financials' | 'analytics' | 'tours';

const partnerTypeConfig: Record<PartnerType, { icon: React.ReactNode }> = {
  [PartnerType.BikeDriver]: { icon: <MotorcycleIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.CarDriver]: { icon: <CarIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.LorryDriver]: { icon: <CarIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.FoodVendor]: { icon: <FoodIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.StreetShop]: { icon: <ShoppingBagIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.CarRental]: { icon: <KeyIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.BikeRental]: { icon: <KeyIcon className="w-5 h-5 mr-2" /> },
  [PartnerType.LocalBusiness]: { icon: <BriefcaseIcon className="w-5 h-5 mr-2" /> },
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, onSwitchRole }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<PartnerApplication | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeAppTab, setActiveAppTab] = useState<PartnerType>(PartnerType.BikeDriver);
  const [view, setView] = useState<AdminView>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [statsRes, appsRes, partnersRes] = await Promise.all([
      supabase.from('admin_stats').select(),
      supabase.from('partner_applications').select(),
      supabase.from('partners').select(),
    ]);

    if (statsRes.data) setStats(statsRes.data[0]);
    if (appsRes.data) setApplications(appsRes.data);
    if (partnersRes.data) setPartners(partnersRes.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(true);
    await supabase.from('partner_applications').update({ status }).eq('id', id);
    await fetchData(); 
    setSelectedApp(null);
    setActionLoading(false);
  };
  
  const handleViewChange = (newView: AdminView) => {
    setSelectedPartner(null);
    setView(newView);
  }

  const filteredApplications = applications.filter(app => app.partnerType === activeAppTab && app.status === 'pending');
  
  const filteredPartners = useMemo(() => {
    return partners.filter(partner =>
      (partner.profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
       partner.partnerType.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [partners, searchTerm]);

  const statusBadge = (status: 'active' | 'pending' | 'suspended' | 'approved' | 'rejected') => {
    const statusClasses: Record<typeof status, string> = {
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
    switch(view) {
        case 'applications': return 'Application Management';
        case 'partners': return 'Partner Directory';
        case 'financials': return 'Financial Overview';
        case 'analytics': return 'Business Analytics';
        case 'tours': return 'Tour Destination Management';
        default: return 'Admin Dashboard';
    }
  };

  const renderContent = () => {
    if (selectedPartner) {
        return <PartnerDetails partner={selectedPartner} onBack={() => setSelectedPartner(null)} />;
    }
    switch (view) {
        case 'financials':
            return <FinancialsPage />;
        case 'analytics':
            return <AnalyticsPage />;
        case 'tours':
            return <TourManagementPage />;
        case 'applications':
        case 'partners':
        default:
            return (
                 <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard title="Total Partners" value={stats?.totalPartners ?? '...'} icon={<UserGroupIcon className="w-6 h-6"/>} />
                    <StatCard title="Pending Applications" value={stats?.pendingApplications ?? '...'} icon={<DocumentTextIcon className="w-6 h-6"/>} />
                    <StatCard title="Active Drivers" value={stats?.activeDrivers ?? '...'} icon={<CheckCircleIcon className="w-6 h-6"/>} />
                    <StatCard title="Vendors & Businesses" value={stats?.activeVendorsAndBusinesses ?? '...'} icon={<StoreIcon className="w-6 h-6"/>} />
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
                              <button onClick={() => setView('applications')} className={`px-4 py-2 text-sm font-medium border ${view === 'applications' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-l-md focus:z-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}>
                                  Applications
                              </button>
                              <button onClick={() => setView('partners')} className={`px-4 py-2 text-sm font-medium border ${view === 'partners' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'} rounded-r-md focus:z-10 focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}>
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
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } flex items-center whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors focus:outline-none`}
                              >
                                {partnerTypeConfig[type].icon}
                                {type}
                              </button>
                            ))}
                          </nav>
                        </div>
                        {/* Applications Table */}
                        <div className="overflow-x-auto">
                          {loading ? <p className="p-6 text-center text-gray-500">Loading...</p> : (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => setSelectedApp(app)} className="text-blue-600 hover:text-blue-900">View Details</button></td>
                                  </tr>
                                )) : <tr><td colSpan={4} className="text-center py-10 px-6 text-gray-500">No pending applications in this category.</td></tr>}
                              </tbody>
                            </table>
                          )}
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
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                          {loading ? <p className="p-6 text-center text-gray-500">Loading partners...</p> : (
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
                          )}
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
      onSwitchRole={onSwitchRole}
      adminView={view}
      onAdminViewChange={handleViewChange}
    >
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