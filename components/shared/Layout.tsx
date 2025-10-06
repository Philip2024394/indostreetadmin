import React, { useState, useEffect, Fragment } from 'react';
import { User, Role, AdminMessage } from '../../types';
import * as api from '../../services/supabase';
import MessagesModal from './MessagesModal';
import ToggleSwitch from './ToggleSwitch';
import { useContent } from '../../contexts/ContentContext';
import { Editable } from './Editable';
// Fix: Add CheckCircleIcon to imports
import { LogoutIcon, ShieldCheckIcon, CarIcon, StoreIcon, UserGroupIcon, DocumentTextIcon, DollarSignIcon, ChartBarIcon, BellIcon, LandmarkIcon, ClipboardListIcon, BanknotesIcon, MotorcycleIcon, SparklesIcon, RealCarIcon, DevicePhoneMobileIcon, CalendarIcon, BriefcaseIcon, CheckCircleIcon, IdCardIcon, BookOpenIcon, FoodIcon, MenuIcon, XIcon, UserCircleIcon, InformationCircleIcon, LockClosedIcon, ServerIcon } from './Icons';

type AdminView = 'applications' | 'partners' | 'members' | 'financials' | 'analytics' | 'tours' | 'siteContent' | 'renewals' | 'fleet' | 'massage' | 'massageDirectory' | 'agents' | 'agentApplications' | 'foodDirectory' | 'supabaseStatus' | 'databaseSetup';
type AgentView = 'prospects' | 'my-partners' | 'renewals' | 'pricing';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  title: string;
  // Generic nav props
  navItems?: Array<{ label: React.ReactNode; view: string; icon?: React.ReactNode; }>;
  currentView?: string;
  onViewChange?: (view: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, title, navItems, currentView, onViewChange }) => {
  const isMaintenanceMode = user.isMaintenanceMode;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState<AdminMessage[]>([]);
  const [isMessagesModalOpen, setIsMessagesModalOpen] = useState(false);
  const { isEditMode, setIsEditMode } = useContent();

  const navLinkClasses = "flex items-center px-4 py-2 text-gray-300 rounded-md transition-colors duration-200 hover:bg-gray-700 w-full text-left";
  const activeNavLinkClasses = "bg-gray-700 text-white font-semibold";

  useEffect(() => {
    if (user.role === Role.Admin || user.role === Role.Agent) return; // No notifications for admin/agent

    // Initial fetch
    api.getMessages().then(data => {
        if (data) {
            const myMessages = data.filter(m => m.recipientId === user.id || m.recipientId === 'all');
            const myUnread = myMessages.filter(m => !m.readBy.includes(user.id));
            setUnreadMessages(myUnread);
        }
    }).catch(error => console.error("Failed to fetch initial messages:", error));
    
    // Realtime subscription
    const channel = api.supabase.channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            const newMessage = payload.new as AdminMessage;
            if ((newMessage.recipientId === user.id || newMessage.recipientId === 'all') && !newMessage.readBy.includes(user.id)) {
                setUnreadMessages(prev => [newMessage, ...prev]);
            }
        })
        .subscribe();
        
    // Cleanup
    return () => {
        api.supabase.removeChannel(channel);
    };
  }, [user.id, user.role]);

  const handleOpenMessages = () => {
      setIsMessagesModalOpen(true);
  };
  
  const handleCloseMessages = async () => {
    try {
        await Promise.all(unreadMessages.map(msg => {
            const newReadBy = [...msg.readBy, user.id];
            return api.updateMessage(msg.id, { readBy: newReadBy });
        }));
    } catch (error) {
        console.error("Failed to mark messages as read:", error);
    }
    setUnreadMessages([]);
    setIsMessagesModalOpen(false);
  };
  
  const handleViewClick = (view: string) => {
    onViewChange?.(view);
    setSidebarOpen(false); // Close mobile nav on selection
  };
  
  const renderNavLinks = () => {
    if (isMaintenanceMode) {
        return (
            <>
                 <button onClick={() => handleViewClick('databaseSetup')} className={`${navLinkClasses} ${currentView === 'databaseSetup' ? activeNavLinkClasses : ''}`}>
                  <ServerIcon className="w-5 h-5 mr-3" />
                  Database Setup
                </button>
                <button onClick={() => handleViewClick('supabaseStatus')} className={`${navLinkClasses} ${currentView === 'supabaseStatus' ? activeNavLinkClasses : ''}`}>
                  <ServerIcon className="w-5 h-5 mr-3" />
                  Supabase Status
                </button>
            </>
        )
    }

    if (navItems) {
      return (
        <>
          {navItems.map(item => (
            <button key={item.view} onClick={() => handleViewClick(item.view)} className={`${navLinkClasses} ${currentView === item.view ? activeNavLinkClasses : ''}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </>
      );
    }
    
    if (user.role === Role.Admin) {
      return (
          <>
              <button onClick={() => handleViewClick('applications')} className={`${navLinkClasses} ${currentView === 'applications' ? activeNavLinkClasses : ''}`}>
                <DocumentTextIcon className="w-5 h-5 mr-3" />
                Partner Applications
              </button>
              <button onClick={() => handleViewClick('agentApplications')} className={`${navLinkClasses} ${currentView === 'agentApplications' ? activeNavLinkClasses : ''}`}>
                  <IdCardIcon className="w-5 h-5 mr-3" />
                  Agent Applications
              </button>
               <button onClick={() => handleViewClick('partners')} className={`${navLinkClasses} ${currentView === 'partners' ? activeNavLinkClasses : ''}`}>
                <UserGroupIcon className="w-5 h-5 mr-3" />
                Partners
              </button>
              <button onClick={() => handleViewClick('agents')} className={`${navLinkClasses} ${currentView === 'agents' ? activeNavLinkClasses : ''}`}>
                <BriefcaseIcon className="w-5 h-5 mr-3" />
                Agents
              </button>
              <button onClick={() => handleViewClick('members')} className={`${navLinkClasses} ${currentView === 'members' ? activeNavLinkClasses : ''}`}>
                <DevicePhoneMobileIcon className="w-5 h-5 mr-3" />
                Members
              </button>
              <button onClick={() => handleViewClick('fleet')} className={`${navLinkClasses} ${currentView === 'fleet' ? activeNavLinkClasses : ''}`}>
                <RealCarIcon className="w-5 h-5 mr-3" />
                Fleet Management
              </button>
              <button onClick={() => handleViewClick('foodDirectory')} className={`${navLinkClasses} ${currentView === 'foodDirectory' ? activeNavLinkClasses : ''}`}>
                <FoodIcon className="w-5 h-5 mr-3" />
                Food Directory
              </button>
              <button onClick={() => handleViewClick('massage')} className={`${navLinkClasses} ${currentView === 'massage' ? activeNavLinkClasses : ''}`}>
                  <SparklesIcon className="w-5 h-5 mr-3" />
                  Massage & Wellness
              </button>
              <button onClick={() => handleViewClick('massageDirectory')} className={`${navLinkClasses} ${currentView === 'massageDirectory' ? activeNavLinkClasses : ''}`}>
                  <BookOpenIcon className="w-5 h-5 mr-3" />
                  Massage Directory
              </button>
              <button onClick={() => handleViewClick('renewals')} className={`${navLinkClasses} ${currentView === 'renewals' ? activeNavLinkClasses : ''}`}>
                <BanknotesIcon className="w-5 h-5 mr-3" />
                Renewals
              </button>
              <button onClick={() => handleViewClick('financials')} className={`${navLinkClasses} ${currentView === 'financials' ? activeNavLinkClasses : ''}`}>
                <DollarSignIcon className="w-5 h-5 mr-3" />
                Financials
              </button>
              <button onClick={() => handleViewClick('analytics')} className={`${navLinkClasses} ${currentView === 'analytics' ? activeNavLinkClasses : ''}`}>
                <ChartBarIcon className="w-5 h-5 mr-3" />
                Analytics
              </button>
              <button onClick={() => handleViewClick('tours')} className={`${navLinkClasses} ${currentView === 'tours' ? activeNavLinkClasses : ''}`}>
                <LandmarkIcon className="w-5 h-5 mr-3" />
                Tours
              </button>
              <button onClick={() => handleViewClick('siteContent')} className={`${navLinkClasses} ${currentView === 'siteContent' ? activeNavLinkClasses : ''}`}>
                <ClipboardListIcon className="w-5 h-5 mr-3" />
                Site Content
              </button>
              <div className="pt-4 mt-4 border-t border-gray-800">
                <button onClick={() => handleViewClick('supabaseStatus')} className={`${navLinkClasses} ${currentView === 'supabaseStatus' ? activeNavLinkClasses : ''}`}>
                  <ServerIcon className="w-5 h-5 mr-3" />
                  Supabase Status
                </button>
                <button onClick={() => handleViewClick('databaseSetup')} className={`${navLinkClasses} ${currentView === 'databaseSetup' ? activeNavLinkClasses : ''}`}>
                  <ServerIcon className="w-5 h-5 mr-3" />
                  Database Setup
                </button>
              </div>
          </>
      );
    }

    if (user.role === Role.Agent) {
      return (
        <>
            <button onClick={() => handleViewClick('prospects')} className={`${navLinkClasses} ${currentView === 'prospects' ? activeNavLinkClasses : ''}`}>
              <DocumentTextIcon className="w-5 h-5 mr-3" /> Prospect Management
            </button>
            <button onClick={() => handleViewClick('my-partners')} className={`${navLinkClasses} ${currentView === 'my-partners' ? activeNavLinkClasses : ''}`}>
              <CheckCircleIcon className="w-5 h-5 mr-3" /> My Partners
            </button>
            <button onClick={() => handleViewClick('renewals')} className={`${navLinkClasses} ${currentView === 'renewals' ? activeNavLinkClasses : ''}`}>
              <CalendarIcon className="w-5 h-5 mr-3" /> Renewal Follow-ups
            </button>
            <button onClick={() => handleViewClick('pricing')} className={`${navLinkClasses} ${currentView === 'pricing' ? activeNavLinkClasses : ''}`}>
              <DollarSignIcon className="w-5 h-5 mr-3" /> Pricing & Commission
            </button>
        </>
      );
    }
    
    return (
      <button type="button" className={`${navLinkClasses} ${activeNavLinkClasses}`}>
        Dashboard
      </button>
    );
  };

  const SidebarContent = () => (
      <div className="flex flex-col flex-1">
        <div className="flex items-center justify-center h-20 border-b border-gray-800 flex-shrink-0">
          <h1 className="text-2xl font-bold">
            <span className="text-white">Indo</span><span className="text-orange-500">Street</span>
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {renderNavLinks()}
        </nav>
        <div className="p-4 border-t border-gray-800 mt-auto flex-shrink-0">
          <p className="text-sm text-gray-400">Signed in as</p>
          <p className="font-semibold">{user.profile.name || user.email}</p>
        </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Nav */}
       <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
          {/* Overlay */}
          <div className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)}></div>
          
          {/* Drawer */}
          <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-black text-white transform transition-transform ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
             <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button onClick={() => setSidebarOpen(false)} className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Close sidebar</span>
                    <XIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            <SidebarContent />
          </div>
       </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-black text-white">
          <SidebarContent />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-500 focus:outline-none">
             <MenuIcon className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg font-bold text-gray-800 md:hidden">
            <span className="text-gray-800">Indo</span><span className="text-orange-500">Street</span>
          </h1>

          <div className="flex items-center space-x-4">
            {user.role === Role.Admin && !isMaintenanceMode && (
              <div className="border-r pr-4 hidden sm:block">
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
              <span className="hidden sm:inline">Logout</span>
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