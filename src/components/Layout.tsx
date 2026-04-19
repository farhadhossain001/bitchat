import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { useThemeStore } from '../store/useThemeStore';
import { LogOut, Search, User, MessageCircle, UserPlus, Check, X, Shield, Sparkles, Moon, Sun } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthStore();
  const { 
    friends, pendingRequests, exploreUsers, 
    fetchFriends, activeChat, setActiveChat,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest
  } = useChatStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'explore'>('friends');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchFriends(user.id);
    }
  }, [user, fetchFriends]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <div className="flex h-[100dvh] bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans custom-scroll selection:bg-indigo-500/30 transition-colors duration-300">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 dark:bg-indigo-900/10 blur-[120px]" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 dark:bg-purple-900/10 blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className={`w-full md:w-[340px] flex-shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-r border-slate-200/50 dark:border-white/5 flex flex-col transition-all duration-500 z-10 relative ${isChatPage ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-white/5 flex justify-between items-center bg-transparent">
          <div className="flex items-center gap-3">
             <div className="relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
              <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md dark:shadow-2xl p-[1px]">
                  <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[11px] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-500" />
                  </div>
              </div>
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">BitChat</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{user?.email?.split('@')[0]}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all duration-300" title="Toggle Theme">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button onClick={handleLogout} className="p-2.5 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300" title="Log out">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 px-5">
          <div className="relative group">
             <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors z-10" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="relative z-10 w-full bg-slate-100/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 border border-slate-200 dark:border-white/5 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex px-5 mb-2 gap-1 relative z-10">
          {[
            { id: 'friends', label: 'Chats', count: 0 },
            { id: 'requests', label: 'Requests', count: pendingRequests.length },
            { id: 'explore', label: 'Explore', count: 0 }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-widest relative rounded-lg transition-all duration-300 ${activeTab === tab.id ? 'text-indigo-700 dark:text-white bg-indigo-50 dark:bg-white/10 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5'}`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="absolute -top-1 -right-1 flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40 text-[9px] text-white font-bold border-2 border-white dark:border-slate-900">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 z-10 scrollbar-hide">
          {activeTab === 'friends' && (
            <div className="space-y-1.5 mt-2">
              {friends.length === 0 ? (
                <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                     <MessageCircle className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                   </div>
                  <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">No active chats</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 max-w-[200px]">Go to Explore to find friends and start chatting!</p>
                </div>
              ) : (
                friends.map((friend) => {
                  const isActive = activeChat?.id === friend.id && isChatPage;
                  return (
                    <button
                      key={friend.id}
                      onClick={() => {
                        setActiveChat(friend);
                        navigate(`/chat/${friend.id}`);
                      }}
                      className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50/50 dark:from-indigo-500/15 dark:to-purple-500/5 border border-indigo-200 dark:border-indigo-500/20 shadow-sm' 
                          : 'hover:bg-slate-50 dark:hover:bg-white/[0.03] border border-transparent'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-inner transition-all duration-500 ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-white group-hover:bg-slate-400 dark:group-hover:bg-slate-700'}`}>
                          {friend.name ? friend.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-[3px] rounded-full transition-colors ${isActive ? 'border-white dark:border-indigo-900' : 'border-white dark:border-slate-900'}`}></span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline mb-1">
                          <p className={`font-semibold text-[15px] truncate transition-colors ${isActive ? 'text-indigo-900 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                            {friend.name || friend.id.substring(0, 8)}
                          </p>
                        </div>
                        <p className={`text-xs truncate transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-200' : 'text-slate-500 dark:text-slate-400'}`}>Tap to view conversation</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="space-y-2 mt-2">
              {pendingRequests.length === 0 ? (
                <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                     <Shield className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                   </div>
                  <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">All caught up</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">No pending requests.</p>
                </div>
              ) : (
                pendingRequests.map((reqUser) => (
                  <div key={reqUser.id} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-white/5 shadow-sm">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800/80 shadow-inner">
                      {reqUser.name ? reqUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{reqUser.name || 'User'}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">Wants to connect</p>
                    </div>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => user && acceptFriendRequest(user.id, reqUser.id)}
                        className="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white hover:shadow-md transition-all duration-300"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => user && rejectFriendRequest(user.id, reqUser.id)}
                        className="p-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-500 hover:text-white dark:hover:bg-red-500 dark:hover:text-white hover:shadow-md transition-all duration-300"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'explore' && (
            <div className="space-y-2 mt-2">
              {exploreUsers.length === 0 ? (
                <div className="px-4 py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-4">
                     <Search className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                   </div>
                  <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">No new users</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Check back later for more people.</p>
                </div>
              ) : (
                exploreUsers.map((exploreUser) => (
                  <div key={exploreUser.id} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent hover:border-slate-100 dark:hover:border-white/5 transition-all duration-300 group">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold bg-slate-200 dark:bg-slate-800 shadow-inner group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-purple-500 transition-colors">
                      {exploreUser.name ? exploreUser.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-slate-700 dark:text-slate-200 truncate">{exploreUser.name || 'User'}</p>
                      <p className="text-[10px] text-slate-500">BitChat User</p>
                    </div>
                    <button 
                      onClick={() => user && sendFriendRequest(user.id, exploreUser.id)}
                      className="p-2.5 text-slate-400 bg-slate-100 dark:bg-white/5 hover:bg-indigo-500 hover:text-white dark:hover:bg-indigo-500 dark:hover:text-white rounded-xl hover:shadow-md transition-all duration-300 flex items-center justify-center"
                      title="Add Friend"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 min-h-0 flex flex-col bg-slate-50 dark:bg-slate-950 relative z-0 ${!isChatPage ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </div>
    </div>
  );
}
