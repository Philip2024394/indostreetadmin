import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { User, RideRequest, Partner, Transaction, Feedback, Payout } from '../../types';
import * as api from '../../services/supabase';
import Layout from '../shared/Layout';
import ToggleSwitch from '../shared/ToggleSwitch';
import RideRequestCard from './RideRequestCard';
import MembershipExpiryNotification from '../shared/MembershipExpiryNotification';
import RenewalModal from '../shared/RenewalModal';
import { 
    ClockIcon,
    DollarSignIcon, 
    TrendingUpIcon, 
    ChartBarIcon, 
    MapPinIcon, 
    StarIcon, 
    CheckIcon, 
    XIcon, 
    CalendarIcon, 
    BanknotesIcon, 
    ChevronDownIcon,
    BriefcaseIcon,
    CheckCircleIcon
} from '../shared/Icons';
import StatCard from '../admin/StatCard';


// Type for navigation
type DriverView = 'dashboard' | 'earnings' | 'performance' | 'heatmap';

// #region Helper and Page Components

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

// --- Dashboard Home Page ---
const DashboardHome: React.FC<{ partner: Partner | null, isOnline: boolean, onOnlineChange: (isOnline: boolean) => void, transactions: Transaction[] }> = ({ partner, isOnline, onOnlineChange, transactions }) => {
    const [requests, setRequests] = useState<RideRequest[]>([]);
    const requestInterval = useRef<number | null>(null);

    const todayStats = useMemo(() => {
        const todayTx = transactions.filter(tx => isToday(new Date(tx.date)) && tx.status === 'completed');
        const earnings = todayTx.reduce((sum, tx) => sum + tx.amount, 0);
        const trips = todayTx.length;
        // Hours online is a mock value for this implementation
        const hoursOnline = isOnline ? ((Date.now() - (partner?.memberSince ? new Date(partner.memberSince).getTime() : Date.now())) / 3600000 % 8).toFixed(1) : '0.0';
        return { earnings, trips, hoursOnline };
    }, [transactions, isOnline, partner]);

    const fetchNewRequest = useCallback(async () => {
        try {
            const data = await api.getRideRequests();
            if (data && data.length > 0) {
              const newRequest = { ...data[0], id: `ride-${Date.now()}` };
              setRequests(prev => [newRequest, ...prev].slice(0, 5));
            }
        } catch (error) { console.error("Failed to fetch ride requests:", error); }
    }, []);

    useEffect(() => {
        if (isOnline) {
          fetchNewRequest();
          requestInterval.current = setInterval(fetchNewRequest, 7000);
        } else {
          if (requestInterval.current) clearInterval(requestInterval.current);
          setRequests([]);
        }
        return () => { if (requestInterval.current) clearInterval(requestInterval.current); };
    }, [isOnline, fetchNewRequest]);

    const handleAcceptReject = (id: string) => {
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-md flex flex-col sm:flex-row justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Your Status</h3>
                <ToggleSwitch enabled={isOnline} onChange={onOnlineChange} enabledText="You are Online" disabledText="You are Offline" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title="Today's Earnings" value={`Rp ${todayStats.earnings.toLocaleString('id-ID')}`} icon={<DollarSignIcon className="w-6 h-6"/>} />
                <StatCard title="Trips Completed Today" value={todayStats.trips} icon={<CheckCircleIcon className="w-6 h-6"/>} />
                <StatCard title="Hours Online" value={`${todayStats.hoursOnline}h`} icon={<ClockIcon className="w-6 h-6"/>} />
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Incoming Requests</h3>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                     {isOnline && requests.length === 0 && (
                        <div className="text-center py-10 border-2 border-dashed rounded-lg">
                            <p className="text-gray-500 font-medium">Waiting for requests...</p>
                        </div>
                    )}
                    {requests.map(req => (
                        <RideRequestCard key={req.id} request={req} onAccept={handleAcceptReject} onReject={handleAcceptReject} />
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Earnings Page ---
const EarningsPage: React.FC<{ partner: Partner, transactions: Transaction[], payouts: Payout[], onUpdate: (data: Partial<Partner>) => Promise<void> }> = ({ partner, transactions, payouts, onUpdate }) => {
    // This would be more complex with real data, but for mock, we'll just show all.
    const platformFee = 0.20; // 20%
    const totalEarnings = transactions.filter(t => t.status === 'completed').reduce((sum, tx) => sum + tx.amount, 0);
    const netPayout = totalEarnings * (1 - platformFee);

    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <StatCard title="Total Revenue" value={`Rp ${totalEarnings.toLocaleString('id-ID')}`} icon={<DollarSignIcon className="w-6 h-6"/>} />
                 <StatCard title="Platform Fees" value={`- Rp ${(totalEarnings * platformFee).toLocaleString('id-ID')}`} icon={<BriefcaseIcon className="w-6 h-6"/>} />
                 <StatCard title="Net Payout" value={`Rp ${netPayout.toLocaleString('id-ID')}`} icon={<TrendingUpIcon className="w-6 h-6"/>} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Earnings Graph</h3>
                <div className="h-48 flex items-center justify-center bg-gray-50 rounded-md text-gray-500">Earnings graph would be displayed here.</div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TransactionHistory transactions={transactions} />
                <PayoutManagement partner={partner} payouts={payouts} onUpdate={onUpdate} />
            </div>
        </div>
    );
};

const TransactionHistory: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Trip History</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
            {transactions.filter(t => t.status === 'completed').map(tx => <TransactionItem key={tx.id} transaction={tx} />)}
        </div>
    </div>
);

const TransactionItem: React.FC<{ transaction: Transaction }> = ({ transaction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const breakdown = transaction.breakdown;
    return (
        <div className="border rounded-md">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full text-left p-3 flex justify-between items-center hover:bg-gray-50">
                <div>
                    <p className="font-medium text-sm">{transaction.details}</p>
                    <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-green-600">Rp {transaction.amount.toLocaleString('id-ID')}</p>
                    {breakdown && <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
                </div>
            </button>
            {isOpen && breakdown && (
                <div className="bg-gray-50 p-3 border-t text-xs space-y-1">
                    <div className="flex justify-between"><span>Base Fare:</span><span>Rp {breakdown.baseFare.toLocaleString('id-ID')}</span></div>
                    {breakdown.tip && <div className="flex justify-between"><span>Tip:</span><span>Rp {breakdown.tip.toLocaleString('id-ID')}</span></div>}
                    {breakdown.bonus && <div className="flex justify-between"><span>Bonus:</span><span>Rp {breakdown.bonus.toLocaleString('id-ID')}</span></div>}
                    <div className="flex justify-between text-red-600"><span>Platform Fee:</span><span>Rp {breakdown.platformFee.toLocaleString('id-ID')}</span></div>
                </div>
            )}
        </div>
    );
};

const PayoutManagement: React.FC<{partner: Partner; payouts: Payout[]; onUpdate: (data: Partial<Partner>) => Promise<void>}> = ({ partner, payouts, onUpdate }) => {
     const [bankDetails, setBankDetails] = useState(partner.bankDetails || { bankName: '', accountHolderName: '', accountNumber: '' });
     const [isEditing, setIsEditing] = useState(false);

    const handleSave = async () => {
        await onUpdate({ bankDetails });
        setIsEditing(false);
    }
    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Payout History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {payouts.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <div>
                                <p className="font-medium">Rp {p.amount.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs font-bold text-green-600 capitalize">{p.status}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t pt-4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Bank Account</h3>
                    {!isEditing && <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-orange-600">Edit</button>}
                </div>
                {isEditing ? (
                    <div className="space-y-3">
                        <input value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} placeholder="Bank Name" className="w-full border rounded-md p-2 text-sm"/>
                        <input value={bankDetails.accountHolderName} onChange={e => setBankDetails({...bankDetails, accountHolderName: e.target.value})} placeholder="Account Holder Name" className="w-full border rounded-md p-2 text-sm"/>
                        <input value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} placeholder="Account Number" className="w-full border rounded-md p-2 text-sm"/>
                        <div className="flex justify-end space-x-2">
                             <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm bg-gray-200 rounded-md">Cancel</button>
                             <button onClick={handleSave} className="px-3 py-1 text-sm bg-orange-500 text-white rounded-md">Save</button>
                        </div>
                    </div>
                ) : (
                     <div className="text-sm space-y-1">
                        <p><strong>Bank:</strong> {bankDetails.bankName}</p>
                        <p><strong>Holder:</strong> {bankDetails.accountHolderName}</p>
                        <p><strong>Account No:</strong> **** **** {bankDetails.accountNumber.slice(-4)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Performance Page ---
const PerformancePage: React.FC<{ partner: Partner, feedback: Feedback[] }> = ({ partner, feedback }) => (
    <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">My Performance Scorecard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <ScorecardItem title="Average Rating" value={partner.rating.toFixed(2)} icon={<StarIcon className="w-6 h-6 text-yellow-500"/>} />
                <ScorecardItem title="Acceptance Rate" value={`${partner.acceptanceRate || 0}%`} icon={<CheckCircleIcon className="w-6 h-6 text-green-500"/>} />
                <ScorecardItem title="Cancellation Rate" value={`${partner.cancellationRate || 0}%`} icon={<XIcon className="w-6 h-6 text-red-500"/>} />
            </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ratings and Feedback</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {feedback.map(fb => (
                    <div key={fb.id} className="p-3 bg-gray-50 rounded-md border">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => <StarIcon key={i} className={`w-4 h-4 ${i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />)}
                            </div>
                            <span className="text-xs text-gray-500">{new Date(fb.date).toLocaleDateString()}</span>
                        </div>
                        {fb.comment && <p className="text-sm text-gray-700 mt-2 italic">"{fb.comment}"</p>}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ScorecardItem: React.FC<{title: string, value: string | number, icon: React.ReactNode}> = ({ title, value, icon }) => (
    <div className="p-4 border rounded-lg text-center">
        <div className="w-12 h-12 mx-auto flex items-center justify-center rounded-full bg-gray-100 mb-2">{icon}</div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
);


// --- Heatmap Page ---
const HeatmapPage: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!mapRef.current || !window.google) return;

        const map = new window.google.maps.Map(mapRef.current!, {
            center: { lat: -6.2088, lng: 106.8456 }, // Jakarta
            zoom: 12,
        });

        const heatmapData = [
            { location: new window.google.maps.LatLng(-6.1754, 106.8272), weight: 3 }, // Monas
            { location: new window.google.maps.LatLng(-6.224, 106.809), weight: 2 }, // SCBD
            { location: new window.google.maps.LatLng(-6.2447, 106.801), weight: 1.5 }, // Blok M
            { location: new window.google.maps.LatLng(-6.1352, 106.8133), weight: 1 }, // Kota Tua
            // Add more mock data points
        ];
        
        const heatmap = new window.google.maps.visualization.HeatmapLayer({
            data: heatmapData,
            map: map,
        });
        heatmap.set("radius", 30);

    }, []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Demand Map</h3>
            <p className="text-sm text-gray-500 mb-4">Areas in red have the highest demand right now. Position yourself nearby to get more ride requests.</p>
            <div ref={mapRef} className="h-96 w-full rounded-lg" />
        </div>
    );
};

// #endregion

// --- Main Driver Dashboard Component ---

const DriverDashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [view, setView] = useState<DriverView>('dashboard');
  const [partner, setPartner] = useState<Partner | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const [partnerData, transactionsData, feedbackData, payoutsData] = await Promise.all([
            api.getPartner(user.id),
            api.getTransactionsForPartner(user.id),
            api.getFeedbackForPartner(user.id),
            api.getPayoutsForPartner(user.id),
        ]);
        setPartner(partnerData);
        setTransactions(transactionsData);
        setFeedback(feedbackData);
        setPayouts(payoutsData);
    } catch (error) {
        console.error("Failed to fetch driver data:", error);
    } finally {
        setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdatePartner = async (updatedData: Partial<Partner>) => {
      if (!partner) return;
      try {
        const updatedPartner = await api.updatePartner(partner.id, updatedData);
        setPartner(updatedPartner);
      } catch (error) {
          console.error("Failed to update partner:", error);
      }
  };

  const NavButton: React.FC<{ targetView: DriverView; children: React.ReactNode; icon: React.ReactNode }> = ({ targetView, children, icon }) => (
    <button onClick={() => setView(targetView)} className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center sm:justify-start px-3 py-2 text-sm font-medium rounded-md transition-colors ${view === targetView ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
        <span className="mb-1 sm:mb-0 sm:mr-2">{icon}</span>
        {children}
    </button>
  );

  const renderContent = () => {
    if (loading || !partner) {
        return <div className="text-center p-10">Loading dashboard...</div>;
    }
    switch(view) {
        case 'earnings': return <EarningsPage partner={partner} transactions={transactions} payouts={payouts} onUpdate={handleUpdatePartner} />;
        case 'performance': return <PerformancePage partner={partner} feedback={feedback} />;
        case 'heatmap': return <HeatmapPage />;
        case 'dashboard':
        default: return <DashboardHome partner={partner} isOnline={isOnline} onOnlineChange={setIsOnline} transactions={transactions} />;
    }
  }

  return (
    <Layout user={user} onLogout={onLogout} title="Driver Dashboard">
       <div className="mb-6">
          <MembershipExpiryNotification partner={partner} onRenew={() => setIsRenewalModalOpen(true)} />
       </div>
       
       <div className="mb-6 bg-white p-2 rounded-lg shadow-md flex flex-wrap justify-around sm:justify-start gap-2">
           <NavButton targetView="dashboard" icon={<ChartBarIcon className="w-5 h-5"/>}>Dashboard</NavButton>
           <NavButton targetView="earnings" icon={<DollarSignIcon className="w-5 h-5"/>}>Earnings</NavButton>
           <NavButton targetView="performance" icon={<StarIcon className="w-5 h-5"/>}>Performance</NavButton>
           <NavButton targetView="heatmap" icon={<MapPinIcon className="w-5 h-5"/>}>Demand Heatmap</NavButton>
       </div>

       {renderContent()}

      {isRenewalModalOpen && partner && (
        <RenewalModal
          partner={partner}
          onClose={() => setIsRenewalModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </Layout>
  );
};

export default DriverDashboard;