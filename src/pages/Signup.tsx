import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, UserPlus, MessageSquare } from 'lucide-react';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Now insert profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          name: name,
        });
        
      if (profileError) {
        // We will just log it for now if we don't have RLS or tables set up correctly
        console.error('Profile creation error:', profileError);
      }
    }

    navigate('/'); // If we automatically logged in or go to confirm page depending on settings
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] relative overflow-hidden flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8 text-white">
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-pink-600/30 blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/30 blur-[120px]" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-gradient-to-br from-pink-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-extrabold tracking-tight">
          Create an account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Join BitChat today
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-gray-100">
        <div className="bg-white/10 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
          <form className="space-y-6" onSubmit={handleSignup}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Full Name
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-white/5 border border-white/10 block w-full pl-10 sm:text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 py-3 text-white placeholder-gray-500 transition-all focus:bg-white/10"
                  placeholder="John Doe"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border border-white/10 block w-full pl-10 sm:text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 py-3 text-white placeholder-gray-500 transition-all focus:bg-white/10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 block w-full pl-10 sm:text-sm rounded-lg focus:ring-pink-500 focus:border-pink-500 py-3 text-white placeholder-gray-500 transition-all focus:bg-white/10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-blue-600 hover:from-pink-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign up'}
                {!loading && <UserPlus className="ml-2 h-5 w-5" />}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400 bg-[#152033]">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full flex justify-center py-3 px-4 border border-white/20 rounded-lg shadow-sm text-sm font-medium text-white bg-white/5 hover:bg-white/10 focus:outline-none transition-all"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
