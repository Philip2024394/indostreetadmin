import React, { useState, useEffect } from 'react';
import { User, Role, AdminMessage } from '../../types';
import * as api from '../../services/supabase';
import MessagesModal from './MessagesModal';
import ToggleSwitch from './ToggleSwitch';
import { useContent } from '../../contexts/ContentContext';
import { Editable } from './Editable';
// Fix: Add CheckCircleIcon to imports
import { LogoutIcon, ShieldCheckIcon, CarIcon, StoreIcon, UserGroupIcon, DocumentTextIcon, DollarSignIcon, ChartBarIcon, BellIcon, LandmarkIcon, ClipboardListIcon, BanknotesIcon, MotorcycleIcon, SparklesIcon, RealCarIcon, DevicePhoneMobileIcon, CalendarIcon, BriefcaseIcon, CheckCircleIcon, IdCardIcon, BookOpenIcon, FoodIcon } from './Icons';

type AdminView = 'applications' | 'partners' | 'members' | 'financials' | 'analytics' | 'tours' | 'siteContent' | 'renewals' | 'fleet' | 'massage' | 'massageDirectory' | 'agents' | 'agentApplications' | 'foodDirectory';
type AgentView = 'prospects' | 'my-partners' | 'renewals' | 'pricing';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  title: string;
  adminView?: AdminView;
  onAdminViewChange?: (view: AdminView) => void;
  agentView?: AgentView;
  onAgentViewChange?: (view: AgentView) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, title, adminView, onAdminViewChange, agentView, onAgentViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<AdminMessage[]>([]);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const { isEditMode, setIsEditMode } = useContent();
  
  const navLinkClasses = "flex items-center px-4 py-2 text-gray-300 rounded-md transition-colors duration-200 hover:bg-gray-700 w-full text-left";
  const activeNavLinkClasses = "bg-gray-700 text-white font-semibold";

  useEffect(() => {
    if (user.role === Role.Admin || user.role === Role.Agent) return; // No notifications for admin/agent

    const fetchMessages = async () => {
        try {
            const data = await api.getMessages();
            if (data) {
                const myMessages = data.filter(m => m.recipientId === user.id || m.recipientId === 'all');
                const myUnread = myMessages.filter(m => !m.readBy.includes(user.id));
                setUnreadMessages(myUnread);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleOpenMessages = () => {
      setIsMessagesModalOpen(true);
  };
  
  const handleCloseMessages = async () => {
    try {
        // Mark messages as read by updating the backend
        await Promise.all(unreadMessages.map(msg => {
            const newReadBy = [...msg.readBy, user.id];
            return api.updateMessage(msg.id, { readBy: newReadBy });
        }));
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
    }
    setUnreadMessages([]); // Optimistically clear
    setIsMessagesModalOpen(false);
  };

  const AdminNav = () => (
    <>
        <button onClick={() => onAdminViewChange?.('applications')} className={`${navLinkClasses} ${adminView === 'applications' ? activeNavLinkClasses : ''}`}>
          <DocumentTextIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-applications" type="text" defaultValue="Partner Applications" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('agentApplications')} className={`${navLinkClasses} ${adminView === 'agentApplications' ? activeNavLinkClasses : ''}`}>
            <IdCardIcon className="w-5 h-5 mr-3" />
            <Editable editId="layout-nav-agent-applications" type="text" defaultValue="Agent Applications" as="span" />
        </button>
         <button onClick={() => onAdminViewChange?.('partners')} className={`${navLinkClasses} ${adminView === 'partners' ? activeNavLinkClasses : ''}`}>
          <UserGroupIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-partners" type="text" defaultValue="Partners" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('agents')} className={`${navLinkClasses} ${adminView === 'agents' ? activeNavLinkClasses : ''}`}>
          <BriefcaseIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-agents" type="text" defaultValue="Agents" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('members')} className={`${navLinkClasses} ${adminView === 'members' ? activeNavLinkClasses : ''}`}>
          <DevicePhoneMobileIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-members" type="text" defaultValue="Members" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('fleet')} className={`${navLinkClasses} ${adminView === 'fleet' ? activeNavLinkClasses : ''}`}>
          <RealCarIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-fleet" type="text" defaultValue="Fleet Management" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('foodDirectory')} className={`${navLinkClasses} ${adminView === 'foodDirectory' ? activeNavLinkClasses : ''}`}>
          <FoodIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-food-directory" type="text" defaultValue="Food Directory" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('massage')} className={`${navLinkClasses} ${adminView === 'massage' ? activeNavLinkClasses : ''}`}>
            <SparklesIcon className="w-5 h-5 mr-3" />
            <Editable editId="layout-nav-massage" type="text" defaultValue="Massage & Wellness" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('massageDirectory')} className={`${navLinkClasses} ${adminView === 'massageDirectory' ? activeNavLinkClasses : ''}`}>
            <BookOpenIcon className="w-5 h-5 mr-3" />
            <Editable editId="layout-nav-massage-directory" type="text" defaultValue="Massage Directory" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('renewals')} className={`${navLinkClasses} ${adminView === 'renewals' ? activeNavLinkClasses : ''}`}>
          <BanknotesIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-renewals" type="text" defaultValue="Renewals" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('financials')} className={`${navLinkClasses} ${adminView === 'financials' ? activeNavLinkClasses : ''}`}>
          <DollarSignIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-financials" type="text" defaultValue="Financials" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('analytics')} className={`${navLinkClasses} ${adminView === 'analytics' ? activeNavLinkClasses : ''}`}>
          <ChartBarIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-analytics" type="text" defaultValue="Analytics" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('tours')} className={`${navLinkClasses} ${adminView === 'tours' ? activeNavLinkClasses : ''}`}>
          <LandmarkIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-tours" type="text" defaultValue="Tours" as="span" />
        </button>
        <button onClick={() => onAdminViewChange?.('siteContent')} className={`${navLinkClasses} ${adminView === 'siteContent' ? activeNavLinkClasses : ''}`}>
          <ClipboardListIcon className="w-5 h-5 mr-3" />
          <Editable editId="layout-nav-site-content" type="text" defaultValue="Site Content" as="span" />
        </button>
    </>
  );

  const AgentNav = () => (
    <>
        <button onClick={() => onAgentViewChange?.('prospects')} className={`${navLinkClasses} ${agentView === 'prospects' ? activeNavLinkClasses : ''}`}>
          <DocumentTextIcon className="w-5 h-5 mr-3" /> Prospect Management
        </button>
        <button onClick={() => onAgentViewChange?.('my-partners')} className={`${navLinkClasses} ${agentView === 'my-partners' ? activeNavLinkClasses : ''}`}>
          <CheckCircleIcon className="w-5 h-5 mr-3" /> My Partners
        </button>
        <button onClick={() => onAgentViewChange?.('renewals')} className={`${navLinkClasses} ${agentView === 'renewals' ? activeNavLinkClasses : ''}`}>
          <CalendarIcon className="w-5 h-5 mr-3" /> Renewal Follow-ups
        </button>
        <button onClick={() => onAgentViewChange?.('pricing')} className={`${navLinkClasses} ${agentView === 'pricing' ? activeNavLinkClasses : ''}`}>
          <DollarSignIcon className="w-5 h-5 mr-3" /> Pricing & Commission
        </button>
    </>
);

  const DefaultNav = () => (
     <button type="button" className={`${navLinkClasses} ${activeNavLinkClasses}`}>
        Dashboard
      </button>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-black text-white flex flex-col`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-800">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Indo</span><span className="text-orange-500">Street</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user.role === Role.Admin ? <AdminNav /> :
           user.role === Role.Agent ? <AgentNav /> :
           <DefaultNav />}
        </nav>
        <div className="p-4 border-t border-gray-800 mt-auto">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="font-semibold">{user.profile.name || user.email}</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between md:justify-end items-center p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex items-center space-x-4">
            {user.role === Role.Admin && (
              <div className="border-r pr-4">
                 <ToggleSwitch enabled={isEditMode} onChange={setIsEditMode} enabledText="Edit Mode" disabledText="Edit Mode" />
              </div>
            )}
            {user.role !== Role.Admin && user.role !== Role.Agent && (
                <button onClick={handleOpenMessages} className="relative text-gray-500 hover:text-gray-700">
                    <BellIcon className="w-6 h-6" />
                    {unreadMessages.length > 0 && (
                        <span className="absolute top-0 right-0 flex h-5 w-5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-xs items-center justify-center">{unreadMessages.length}</span>
                        </span>
                    )}
                </button>
            )}
            <span className="text-gray-700 hidden sm:block">{user.profile.name || user.email}</span>
            <button onClick={onLogout} className="flex items-center text-sm text-gray-600 hover:text-red-500 transition-colors duration-200">
              <LogoutIcon className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{title}</h2>
            {children}
          </div>
        </main>
      </div>
      {isMessagesModalOpen && <MessagesModal user={user} onClose={handleCloseMessages} />}
    </div>
  );
};

export default Layout;