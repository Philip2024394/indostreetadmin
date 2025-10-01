
import React, { useState, useEffect, useMemo } from 'react';
import * as api from '../../services/supabase';
import { AnalyticsSummary } from '../../types';
import { UserGroupIcon, ChartBarIcon, TrendingUpIcon, TrendingDownIcon } from '../shared/Icons';

const AnalyticsCard: React.FC<{ title: string; value: string; change?: number; icon: React.ReactNode }> = ({ title, value, change, icon }) => (
    <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">{icon}</div>
        </div>
        {change !== undefined && (
            <div className={`mt-2 flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {change >= 0 ? <TrendingUpIcon className="w-4 h-4 mr-1" /> : <TrendingDownIcon className="w-4 h-4 mr-1" />}
                <span>{change.toFixed(1)}% from last month</span>
            </div>
        )}
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[] }> = ({ title, data }) => {
    const maxValue = useMemo(() => Math.max(...data.map(d => d.value)), [data]);
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
            <div className="space-y-4">
                {data.map(item => (
                    <div key={item.label} className="flex items-center">
                        <p className="w-1/3 text-sm text-gray-600">{item.label}</p>
                        <div className="w-2/3 bg-gray-200 rounded-full h-4">
                            <div
                                className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                               <span className="text-xs font-medium text-white">{item.value.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AnalyticsPage: React.FC = () => {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const data = await api.getAnalyticsSummary();
                setSummary(data);
            } catch (error) {
                console.error("Failed to fetch analytics summary:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading || !summary) {
        return <div className="text-center p-10">Loading analytics data...</div>;
    }

    const popularServicesData = summary.popularServices
        .sort((a, b) => b.count - a.count)
        .map(s => ({ label: s.name, value: s.count }));
        
    const peakHoursData = summary.peakHours
        .sort((a, b) => new Date(`1970-01-01 ${a.hour}`).getHours() - new Date(`1970-01-01 ${b.hour}`).getHours())
        .map(h => ({ label: h.hour, value: h.count }));

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsCard
                    title="Total Active Partners"
                    value={summary.partnerGrowth.total.toLocaleString()}
                    change={summary.partnerGrowth.change}
                    icon={<UserGroupIcon className="w-6 h-6" />}
                />
                <AnalyticsCard
                    title="Completed Rides & Orders"
                    value={summary.rideAndOrderVolume.total.toLocaleString()}
                    change={summary.rideAndOrderVolume.change}
                    icon={<ChartBarIcon className="w-6 h-6" />}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BarChart title="Most Popular Services" data={popularServicesData} />
                <BarChart title="Peak Activity Hours" data={peakHoursData} />
            </div>
        </div>
    );
};

export default AnalyticsPage;
