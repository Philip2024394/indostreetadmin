import React, { useState } from 'react';
import * as api from '../../services/supabase';
import { Zone } from '../../types';
import { ChevronLeftIcon, CheckCircleIcon } from '../shared/Icons';

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
            <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-lg shadow-xl text-center p-8">
                    <CheckCircleIcon className="w-16 h-16 mx-auto text-green-500" />
                    <h3 className="text-2xl font-bold mt-4">Account Created!</h3>
                    <p className="text-gray-600 mt-2">Your member account has been created successfully. You can now log in.</p>
                    <button onClick={onBackToLogin} className="mt-6 w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Back to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800 text-center">Create Member Account</h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <InputField name="name" label="Full Name" value={formData.name} onChange={handleChange} required />
                    <InputField name="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} required />
                    <InputField name="password" label="Password" type="password" value={formData.password} onChange={handleChange} required />
                    <InputField name="confirmPassword" label="Confirm Password" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                    <InputField name="whatsapp" label="WhatsApp Number" value={formData.whatsapp} onChange={handleChange} required />
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-gray-700">Your Area/Zone</label>
                        <select id="area" name="area" value={formData.area} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            {Object.values(Zone).map(zone => (
                                <option key={zone} value={zone}>{zone}</option>
                            ))}
                        </select>
                    </div>
                     {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                </form>
                <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
                    <button type="button" onClick={onBackToLogin} className="flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
                        <ChevronLeftIcon className="w-4 h-4 mr-1" />
                        Back to Login
                    </button>
                    <button type="submit" formNoValidate onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const InputField: React.FC<{ name: string; label: string; value?: string | number; onChange: (e: any) => void; type?: string; required?: boolean; }> = 
({ name, label, value, onChange, type = 'text', required = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}{required && ' *'}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} required={required} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"/>
    </div>
);

export default MemberSignupPage;