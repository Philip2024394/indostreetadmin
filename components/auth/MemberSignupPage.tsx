import React, { useState } from 'react';
import * as api from '../../services/supabase';
import { Zone } from '../../types';
import { ChevronLeftIcon, CheckCircleIcon, UserCircleIcon, EnvelopeIcon, LockClosedIcon, DevicePhoneMobileIcon } from '../shared/Icons';

interface MemberSignupPageProps {
  onBackToLogin: () => void;
}

const MemberSignupPage: React.FC<MemberSignupPageProps> = ({ onBackToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        whatsapp: '',
        area: Zone.Zone1,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);
        try {
            await api.signUpMember(formData.name, formData.email, formData.password, formData.whatsapp, formData.area);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred during sign up.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
                <div className="w-full max-w-md bg-gray-800 text-gray-200 rounded-lg shadow-xl text-center p-8">
                    <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                    <h3 className="text-2xl font-bold mt-4">Account Created!</h3>
                    <p className="text-gray-300 mt-2">Your member account has been created successfully. You can now log in.</p>
                    <button onClick={onBackToLogin} className="mt-6 w-full px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-4">
            <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl">
                <div className="p-6 border-b border-gray-700 text-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-white">Indo</span><span className="text-orange-500">Street</span>
                    </h1>
                    <h2 className="text-xl font-semibold text-gray-300 mt-1">Create Your Member Account</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <InputWithIcon icon={<UserCircleIcon />} name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required />
                    <InputWithIcon icon={<EnvelopeIcon />} name="email" type="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
                    <InputWithIcon icon={<LockClosedIcon />} name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                    <InputWithIcon icon={<LockClosedIcon />} name="confirmPassword" type="password" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
                    <InputWithIcon icon={<DevicePhoneMobileIcon />} name="whatsapp" placeholder="WhatsApp Number" value={formData.whatsapp} onChange={handleChange} required />
                    <div>
                        <label htmlFor="area" className="sr-only">Your Area/Zone</label>
                        <select id="area" name="area" value={formData.area} onChange={handleChange} className="w-full bg-gray-700 border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                            {Object.values(Zone).map(zone => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>
                    </div>
                     {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                     <button type="submit" formNoValidate onClick={handleSubmit} disabled={loading} className="w-full px-6 py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:bg-orange-400 font-bold text-base">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="p-6 bg-gray-900/50 border-t border-gray-700 text-center">
                     <button type="button" onClick={onBackToLogin} className="text-sm font-medium text-orange-500 hover:text-orange-400">
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputWithIcon: React.FC<{ icon: React.ReactNode; name: string; placeholder: string; value: string; onChange: (e: any) => void; type?: string; required?: boolean; }> = 
({ icon, name, placeholder, value, onChange, type = 'text', required = false }) => (
    <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {React.cloneElement(icon as React.ReactElement, { className: 'h-5 w-5 text-gray-400' })}
        </div>
        <input 
            type={type} 
            id={name} 
            name={name} 
            placeholder={placeholder}
            value={value} 
            onChange={onChange} 
            required={required} 
            className="block w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm text-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
        />
    </div>
);


export default MemberSignupPage;
