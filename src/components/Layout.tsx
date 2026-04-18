import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { LogOut, Search, User, MessageCircle, UserPlus, Check, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuthStore();
  const { 
    friends, pendingRequests, exploreUsers, 
    fetchFriends, activeChat, setActiveChat,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest
  } = useChatStore();
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
    <div className="flex h-screen bg-[#0f172a] text-gray-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className={`w-full md:w-80 bg-[#162137] border-r border-[#26334d] flex flex-col transition-all duration-300 ${isChatPage ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-[#26334d] flex justify-between items-center bg-[#1a2640]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-[2px]">
               <div className="w-full h-full bg-[#162137] rounded-lg flex items-center justify-center">
                 <MessageCircle className="w-5 h-5 text-indigo-400" />
               </div>
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">BitChat</h1>
              <p className="text-xs text-gray-400 truncate max-w-[120px]">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Log out">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search friends..." 
              className="w-full bg-[#0f172a] text-sm text-gray-200 placeholder-gray-500 rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-[#26334d]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#26334d]">
          <button 
            onClick={() => setActiveTab('friends')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider relative ${activeTab === 'friends' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Chats
            {activeTab === 'friends' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('requests')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider relative ${activeTab === 'requests' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Requests
            {pendingRequests.length > 0 && (
              <span className="absolute top-2 right-2 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                {pendingRequests.length}
              </span>
            )}
            {activeTab === 'requests' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
          </button>
          <button 
            onClick={() => setActiveTab('explore')}
            className={`flex-1 py-3 text-xs font-semibold uppercase tracking-wider relative ${activeTab === 'explore' ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'}`}
          >
            Explore
            {activeTab === 'explore' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 rounded-t-full"></span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No friends yet. Go to Explore to find someone!
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
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-500/10' 
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-gray-300 font-medium ${isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md' : 'bg-[#26334d]'}`}>
                          {friend.name ? friend.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                        </div>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#162137] rounded-full"></span>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex justify-between items-baseline mb-0.5">
                          <p className={`font-semibold text-sm truncate ${isActive ? 'text-indigo-300' : 'text-gray-200'}`}>
                            {friend.name || friend.id.substring(0, 8)}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 truncate">Tap to chat...</p>
                      </div>
                    </button>
                  );
                })
              )}
            </>
          )}

          {activeTab === 'requests' && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No pending friend requests.
                </div>
              ) : (
                pendingRequests.map((reqUser) => (
                  <div key={reqUser.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 font-medium bg-[#26334d]">
                      {reqUser.name ? reqUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-200 truncate">{reqUser.name || 'User'}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => user && acceptFriendRequest(user.id, reqUser.id)}
                        className="p-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => user && rejectFriendRequest(user.id, reqUser.id)}
                        className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                        title="Reject"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'explore' && (
            <>
              {exploreUsers.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No new users found.
                </div>
              ) : (
                exploreUsers.map((exploreUser) => (
                  <div key={exploreUser.id} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 font-medium bg-gradient-to-br from-indigo-900 to-slate-800">
                      {exploreUser.name ? exploreUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-semibold text-sm text-gray-200 truncate">{exploreUser.name || 'User'}</p>
                    </div>
                    <button 
                      onClick={() => user && sendFriendRequest(user.id, exploreUser.id)}
                      className="p-1.5 text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-colors flex items-center gap-1"
                      title="Add Friend"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 min-h-0 flex flex-col bg-[#0f172a] relative ${!isChatPage ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </div>
    </div>
  );
}
