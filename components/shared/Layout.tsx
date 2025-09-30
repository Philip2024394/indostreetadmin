
import React, { useState } from 'react';
import { User, Role } from '../../types';
import { LogoutIcon, ShieldCheckIcon, CarIcon, StoreIcon, UserGroupIcon, DocumentTextIcon, DollarSignIcon, ChartBarIcon } from './Icons';

type AdminView = 'applications' | 'partners' | 'financials' | 'analytics';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  title: string;
  onSwitchRole: (role: Role) => void;
  adminView?: AdminView;
  onAdminViewChange?: (view: AdminView) => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout, children, title, onSwitchRole, adminView, onAdminViewChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const navLinkClasses = "flex items-center px-4 py-2 text-gray-300 rounded-md transition-colors duration-200 hover:bg-gray-700 w-full text-left";
  const activeNavLinkClasses = "bg-gray-700 text-white font-semibold";

  const devLinkClasses = "w-full flex items-center px-4 py-2 text-sm rounded-md transition-colors text-gray-300 hover:bg-gray-600 hover:text-white";
  const activeDevLinkClasses = "bg-gray-600 text-white";
  
  const AdminNav = () => (
    <>
        <button onClick={() => onAdminViewChange?.('applications')} className={`${navLinkClasses} ${adminView === 'applications' ? activeNavLinkClasses : ''}`}>
          <DocumentTextIcon className="w-5 h-5 mr-3" />
          Applications
        </button>
         <button onClick={() => onAdminViewChange?.('partners')} className={`${navLinkClasses} ${adminView === 'partners' ? activeNavLinkClasses : ''}`}>
          <UserGroupIcon className="w-5 h-5 mr-3" />
          Partners
        </button>
        <button onClick={() => onAdminViewChange?.('financials')} className={`${navLinkClasses} ${adminView === 'financials' ? activeNavLinkClasses : ''}`}>
          <DollarSignIcon className="w-5 h-5 mr-3" />
          Financials
        </button>
        <button onClick={() => onAdminViewChange?.('analytics')} className={`${navLinkClasses} ${adminView === 'analytics' ? activeNavLinkClasses : ''}`}>
          <ChartBarIcon className="w-5 h-5 mr-3" />
          Analytics
        </button>
    </>
  );

  const DefaultNav = () => (
     <a href="#" className={`${navLinkClasses} ${activeNavLinkClasses}`}>
        Dashboard
      </a>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-200 ease-in-out z-30 w-64 bg-gray-800 text-white flex flex-col`}>
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <h1 className="text-2xl font-bold">IndoStreet</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {user.role === Role.Admin ? <AdminNav /> : <DefaultNav />}

           {/* DEV QUICK SWITCH */}
          <div className="pt-6 mt-6 border-t border-gray-700">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dev Quick Switch</p>
            <div className="mt-2 space-y-1">
                <button
                    onClick={() => onSwitchRole(Role.Admin)}
                    className={`${devLinkClasses} ${user.role === Role.Admin ? activeDevLinkClasses : ''}`}
                >
                    <ShieldCheckIcon className="w-5 h-5 mr-3" />
                    Admin View
                </button>
                <button
                    onClick={() => onSwitchRole(Role.Driver)}
                    className={`${devLinkClasses} ${user.role === Role.Driver ? activeDevLinkClasses : ''}`}
                >
                    <CarIcon className="w-5 h-5 mr-3" />
                    Driver View
                </button>
                <button
                    onClick={() => onSwitchRole(Role.Vendor)}
                    className={`${devLinkClasses} ${user.role === Role.Vendor ? activeDevLinkClasses : ''}`}
                >
                    <StoreIcon className="w-5 h-5 mr-3" />
                    Vendor View
                </button>
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-gray-700">
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
    </div>
  );
};

export default Layout;