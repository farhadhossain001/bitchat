import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Send, Image as ImageIcon, Mic, ChevronLeft, MoreVertical, Loader2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { supabase } from '../lib/supabase';

export default function Chat() {
  const { userId: friendId } = useParams<{ userId: string }>();
  const { user } = useAuthStore();
  const { friends, messages, loading, fetchMessages, sendMessage, subscribeToMessages, activeChat, setActiveChat } = useChatStore();
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeChat && friendId) {
      const friend = friends.find(f => f.id === friendId);
      if (friend) setActiveChat(friend);
    }
  }, [friendId, friends, activeChat, setActiveChat]);

  useEffect(() => {
    if (user && friendId) {
      fetchMessages(user.id, friendId);
      const unsubscribe = subscribeToMessages(user.id, friendId);
      return () => unsubscribe();
    }
  }, [user, friendId, fetchMessages, subscribeToMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user || !friendId) return;

    const messageContent = content;
    setContent('');

    await sendMessage({
      sender_id: user.id,
      receiver_id: friendId,
      content: messageContent,
      type: 'text',
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !friendId) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `chat-images/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      await sendMessage({
        sender_id: user.id,
        receiver_id: friendId,
        content: '',
        file_url: publicUrl,
        type: 'image',
      });
    } catch (error) {
      console.error('Unexpected error uploading image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (!friendId) return <Layout><div className="flex-1 flex items-center justify-center text-gray-400">Select a chat</div></Layout>;

  return (
    <Layout>
      {/* Header */}
      <div className="h-16 border-b border-[#26334d] bg-[#162137]/90 text-white backdrop-blur-xl flex items-center justify-between px-4 z-20 sticky top-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <span className="font-semibold text-sm">
                {activeChat?.name ? activeChat.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#162137] rounded-full"></span>
          </div>
          <div>
            <h2 className="font-semibold text-sm tracking-tight">{activeChat?.name || 'Loading...'}</h2>
            <p className="text-[11px] text-green-400 font-medium">Online</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:bg-white/5 hover:text-white transition-colors rounded-lg">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-[#0f172a] bg-blend-soft-light relative">
        {/* Subtle gradient background effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-transparent to-[#162137]/50 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col space-y-6">
          {loading && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
                const d = new Date(msg.created_at);
                const timeString = isValid(d) ? format(d, 'h:mm a') : '';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    {!isMe && (
                      <div className={`w-8 h-8 mt-auto mr-2 rounded-full flex-shrink-0 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-semibold shadow-sm ${!showAvatar && 'opacity-0'}`}>
                        {activeChat?.name?.[0].toUpperCase() || '?'}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col relative group`}>
                      <div 
                        className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed relative ${
                          isMe 
                            ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-[#1e293b] text-gray-100 rounded-2xl rounded-bl-sm border border-white/5'
                        }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        {msg.file_url && (
                          <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                            <img src={msg.file_url} alt="attachment" className="max-w-full h-auto object-cover max-h-64" />
                          </div>
                        )}
                      </div>
                      <span className={`text-[10px] text-gray-500 mt-1.5 opacity-0 group-hover:opacity-100 transition-all font-medium ${isMe ? 'mr-1' : 'ml-1'}`}>
                        {timeString} {isMe && '· Read'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} className="h-1 pb-2" />
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-[#162137]/90 backdrop-blur-xl border-t border-[#26334d] z-20 relative">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 mb-0.5 text-gray-400 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-xl transition-all disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          </button>
          <div className="flex-1 bg-[#0f172a] border border-[#26334d] flex items-center rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all px-2 shadow-inner shadow-black/10">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-transparent text-sm text-gray-100 placeholder-gray-500 py-3.5 px-3 focus:outline-none"
            />
            <button type="button" className="p-2 text-gray-400 hover:text-indigo-400 transition-colors">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button 
            type="submit" 
            disabled={!content.trim()}
            className="p-3.5 mb-0.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:from-indigo-500 disabled:to-purple-600 focus:outline-none shadow-lg shadow-indigo-500/20 transition-all ml-1"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </Layout>
  );
}
