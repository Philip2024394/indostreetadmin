import React, { useState } from 'react';
import { User } from '../../types';
import Layout from '../shared/Layout';
import ProspectsPage from './ProspectsPage';
import MyPartnersPage from './MyPartnersPage';
import RenewalsPage from './RenewalsPage';
import PricingPage from './PricingPage';

interface AgentDashboardProps {
  user: User;
  onLogout: () => void;
}

type AgentView = 'prospects' | 'my-partners' | 'renewals' | 'pricing';

const AgentDashboard: React.FC<AgentDashboardProps> = ({ user, onLogout }) => {
  const [view, setView] = useState<AgentView>('prospects');

  const getTitle = () => {
    switch (view) {
      case 'prospects': return 'Prospect Management';
      case 'my-partners': return 'My Signed Partners';
      case 'renewals': return 'Renewal Follow-ups';
      case 'pricing': return 'Pricing & Commissions';
      default: return 'Agent Dashboard';
    }
  };

  const renderContent = () => {
    switch (view) {
      case 'my-partners':
        return <MyPartnersPage agent={user} />;
      case 'renewals':
        return <RenewalsPage agent={user} />;
      case 'pricing':
        return <PricingPage />;
      case 'prospects':
      default:
        return <ProspectsPage agent={user} />;
    }
  };

  return (
    <Layout
      user={user}
      onLogout={onLogout}
      title={getTitle()}
      agentView={view}
      onAgentViewChange={setView}
    >
      {renderContent()}
    </Layout>
  );
};

export default AgentDashboard;
