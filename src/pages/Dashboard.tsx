import Layout from '../components/Layout';
import { MessageSquarePlus } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d2b45] via-[#0f172a] to-[#0f172a] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px]" />
        
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full flex items-center justify-center mb-6 border border-indigo-500/20 shadow-2xl shadow-indigo-500/10 backdrop-blur-sm z-10 relative">
          <MessageSquarePlus className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight text-white z-10 relative">Welcome to BitChat</h2>
        <p className="text-gray-400 max-w-md z-10 relative leading-relaxed">
          Select a conversation from the sidebar or search for a friend to start chatting in real-time.
        </p>
      </div>
    </Layout>
  );
}
