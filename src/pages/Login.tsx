import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
      <main className="flex-grow flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Branding Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container shadow-xl shadow-primary/20 mb-6">
              <span className="material-symbols-outlined text-on-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>chat_bubble</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-primary mb-2 font-headline">BitChat</h1>
            <p className="text-on-surface-variant font-medium">The architectural space for dialogue.</p>
          </div>
          
          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative z-20">
            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm font-medium border border-red-500/20">
                  {error}
                </div>
              )}
              
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-on-surface-variant ml-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">mail</span>
                  </div>
                  <input 
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline-variant font-label" 
                    id="email" 
                    name="email" 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com" 
                  />
                </div>
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="block text-sm font-semibold text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="text-xs font-bold text-primary hover:underline transition-all" href="#">Forgot?</a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline text-xl group-focus-within:text-primary transition-colors">lock</span>
                  </div>
                  <input 
                    className="block w-full pl-11 pr-4 py-3.5 bg-surface-container-low border-transparent rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface placeholder:text-outline-variant font-label" 
                    id="password" 
                    name="password" 
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                  />
                  <button className="absolute inset-y-0 right-0 pr-4 flex items-center" type="button" onClick={() => {
                     const input = document.getElementById('password') as HTMLInputElement;
                     if (input) input.type = input.type === 'password' ? 'text' : 'password';
                  }}>
                    <span className="material-symbols-outlined text-outline hover:text-on-surface-variant transition-colors">visibility</span>
                  </button>
                </div>
              </div>
              
              {/* CTA Button */}
              <button 
                className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold py-4 rounded-full shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50 font-label" 
                type="submit"
                disabled={loading}
              >
                <span>{loading ? 'Logging In...' : 'Log In'}</span>
                {!loading && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
              </button>
            </form>
            
            {/* Footer Links */}
            <div className="mt-10 text-center">
              <p className="text-sm text-on-surface-variant">
                New to the conversation? 
                <Link className="text-primary font-extrabold ml-1 hover:underline" to="/signup">Sign Up</Link>
              </p>
            </div>
          </div>
          
          {/* Bottom Illustration/Decoration */}
          <div className="mt-12 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-2xl">security</span>
              <span className="text-[10px] font-bold tracking-widest uppercase mt-2">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-2xl">bolt</span>
              <span className="text-[10px] font-bold tracking-widest uppercase mt-2">Instant</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="material-symbols-outlined text-2xl">encrypted</span>
              <span className="text-[10px] font-bold tracking-widest uppercase mt-2">Private</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Decorative Background Elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-5%] left-[-5%] w-[30vw] h-[30vw] bg-tertiary-container/10 rounded-full blur-[100px] pointer-events-none z-0"></div>
    </div>
  );
}
