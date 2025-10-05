import React, { useState } from 'react';
import * as api from '../../services/supabase';
import { supabaseInitializationError } from '../../services/supabase';
import { User } from '../../types';
import { Editable } from '../shared/Editable';
import AgentSignupPage from './AgentSignupPage';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('agent@indostreet.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

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
  
  if (showSignup) {
    return <AgentSignupPage onBackToLogin={() => setShowSignup(false)} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            <Editable editId="login-title" type="text" defaultValue="IndoStreet Partner Portal" />
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            <Editable editId="login-subtitle" type="text" defaultValue="Sign in to your account" />
          </p>
        </div>

        {supabaseInitializationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                <p className="font-bold">Configuration Error</p>
                <p>{supabaseInitializationError}</p>
            </div>
        )}

        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-gray-700">
          <p className="font-semibold text-center text-orange-800 mb-2">Demo Accounts (password: "password")</p>
          <ul className="space-y-1">
            <li><strong>Admin:</strong> admin@indostreet.com</li>
            <li><strong>Agent:</strong> agent@indostreet.com</li>
            <li><strong>Bike Driver:</strong> driver@indostreet.com</li>
            <li><strong>Car Driver:</strong> cardriver@indostreet.com</li>
            <li><strong>Lorry Driver:</strong> lorrydriver@indostreet.com</li>
            <li><strong>Jeep Tour Operator:</strong> jeep@indostreet.com</li>
            <li><strong>Food Vendor:</strong> vendor@indostreet.com</li>
            <li><strong>Street Shop:</strong> shop@indostreet.com</li>
            <li><strong>Local Business:</strong> business@indostreet.com</li>
            <li><strong>Car Rental:</strong> carrental@indostreet.com</li>
            <li><strong>Bike Rental:</strong> bikerental@indostreet.com</li>
            <li><strong>Therapist:</strong> therapist@indostreet.com</li>
            <li><strong>Spa/Salon:</strong> spa@indostreet.com</li>
            <li><strong>Hotel Partner:</strong> hotel@indostreet.com</li>
            <li><strong>Villa Partner:</strong> villa@indostreet.com</li>
          </ul>
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
              {loading ? 'Signing in...' : <Editable editId="login-button" type="text" defaultValue="Sign in" as="span" />}
            </button>
          </div>
        </form>
         <div className="text-center text-sm">
            <button onClick={() => setShowSignup(true)} className="font-medium text-orange-600 hover:text-orange-500">
                Register as an Agent
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;