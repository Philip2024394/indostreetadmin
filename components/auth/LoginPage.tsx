import React, { useState } from 'react';
import * as api from '../../services/supabase';
import { supabaseInitializationError } from '../../services/supabase';
import { User } from '../../types';
import { Editable } from '../shared/Editable';
import AgentSignupPage from './AgentSignupPage';
import MemberSignupPage from './MemberSignupPage';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('phillipofarrell@gmail.com');
  const [password, setPassword] = useState('admin1240176');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAgentSignup, setShowAgentSignup] = useState(false);
  const [showMemberSignup, setShowMemberSignup] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user } = await api.login(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };
  
  if (showAgentSignup) {
    return <AgentSignupPage onBackToLogin={() => setShowAgentSignup(false)} />;
  }

  if (showMemberSignup) {
    return <MemberSignupPage onBackToLogin={() => setShowMemberSignup(false)} />;
  }


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            IndoStreet Partner Portal
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>

        {supabaseInitializationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <p className="font-bold">Configuration Error</p>
                <p>{supabaseInitializationError}</p>
            </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold text-center mb-2">Welcome!</p>
          <p>This portal is now fully integrated with Supabase. All user accounts must be created and managed within the Supabase dashboard's Authentication section.</p>
          <p className="mt-2">The previous mock/demo accounts have been removed.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-orange-500 focus:border-orange-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading || !!supabaseInitializationError}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:bg-orange-300"
            >
              {loading ? 'Signing in...' : "Sign in"}
            </button>
          </div>
        </form>
         <div className="text-center text-sm flex justify-center items-center">
            <button onClick={() => setShowAgentSignup(true)} className="font-medium text-orange-600 hover:text-orange-500">
                Register as an Agent
            </button>
            <span className="text-gray-400 mx-2">|</span>
            <button onClick={() => setShowMemberSignup(true)} className="font-medium text-orange-600 hover:text-orange-500">
                Create a Member Account
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
