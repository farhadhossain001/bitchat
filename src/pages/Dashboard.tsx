import Layout from '../components/Layout';
import { Sparkles, MessageCircleHeart } from 'lucide-react';

export default function Dashboard() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden h-full">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
           <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
           <div className="absolute bottom-[20%] right-[30%] w-[40vw] h-[40vw] bg-purple-500/10 dark:bg-purple-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-10 dark:opacity-20 group-hover:opacity-30 dark:group-hover:opacity-40 transition-opacity duration-700"></div>
          
          <div className="w-28 h-28 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mb-8 border border-slate-200/50 dark:border-white/10 shadow-xl shadow-indigo-500/5 dark:shadow-indigo-500/10 relative overflow-hidden group-hover:scale-105 transition-transform duration-500 hover:rotate-3 cursor-default">
             {/* Inner glowing ring */}
             <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500 dark:via-indigo-400 to-transparent opacity-50"></div>
             <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-purple-500 dark:via-purple-400 to-transparent opacity-50"></div>
             
             <MessageCircleHeart className="w-12 h-12 text-indigo-500 dark:text-indigo-400 group-hover:text-purple-500 dark:group-hover:text-purple-400 transition-colors duration-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)] dark:drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 mb-6 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span className="text-xs font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">Start Connecting</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent drop-shadow-sm">
            Welcome to BitChat
          </h2>
          
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm md:text-base leading-relaxed">
            Select a conversation from the sidebar or search for someone new to start an encrypted, real-time sync.
          </p>
        </div>
      </div>
    </Layout>
  );
}
