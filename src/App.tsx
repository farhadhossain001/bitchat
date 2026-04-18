import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';

// Pages
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Signup from './pages/Signup';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-gray-50 text-gray-900">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
};

function App() {
  const { setUser, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [checkSession, setUser]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
