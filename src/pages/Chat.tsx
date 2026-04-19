import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/useAuthStore';
import { useChatStore } from '../store/useChatStore';
import { Send, Image as ImageIcon, Mic, ChevronLeft, MoreVertical, Loader2, Phone, Video } from 'lucide-react';
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

  if (!friendId) return null;

  return (
    <Layout>
      {/* Header */}
      <div className="h-[73px] border-b border-slate-200/50 dark:border-white/5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl text-slate-900 dark:text-white flex items-center justify-between px-6 z-20 sticky top-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/')} 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-indigo-500 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative w-[42px] h-[42px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg border border-white/10">
              <span className="font-bold text-white text-base">
                {activeChat?.name ? activeChat.name.charAt(0).toUpperCase() : '?'}
              </span>
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-[11px] h-[11px] bg-[#22c55e] border-2 border-white dark:border-slate-900 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span>
          </div>
          <div>
            <h2 className="font-bold text-[15px] tracking-wide text-slate-900 dark:text-slate-100">{activeChat?.name || 'Loading...'}</h2>
            <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold tracking-wider uppercase mt-0.5">Online Now</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-indigo-400 transition-all rounded-xl hidden sm:flex">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-indigo-400 transition-all rounded-xl hidden sm:flex">
            <Phone className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white transition-all rounded-xl">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth bg-slate-50 dark:bg-slate-950 relative z-0 custom-scroll transition-colors duration-300">
        <div className="relative z-10 flex flex-col space-y-6 max-w-4xl mx-auto w-full">
          {loading && messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="relative flex justify-center items-center">
                 <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                 <Loader2 className="w-10 h-10 text-indigo-500 dark:text-indigo-400 animate-spin relative z-10" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-5">
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === user?.id;
                const showAvatar = !isMe && (i === 0 || messages[i-1].sender_id !== msg.sender_id);
                const showTail = i === messages.length - 1 || messages[i+1].sender_id !== msg.sender_id;
                
                const d = new Date(msg.created_at);
                const timeString = isValid(d) ? format(d, 'h:mm a') : '';
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}>
                    {!isMe && (
                      <div className={`w-[34px] h-[34px] mt-auto mr-3 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold shadow-md transform transition-transform ${showAvatar ? 'scale-100 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border border-slate-200/50 dark:border-white/10 text-slate-600 dark:text-white' : 'scale-0 w-8 mr-3 opacity-0'}`}>
                        {activeChat?.name?.[0].toUpperCase() || '?'}
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] md:max-w-[65%] ${isMe ? 'items-end' : 'items-start'} flex flex-col relative`}>
                      <div 
                        className={`px-4.5 py-3 shadow-sm text-[15px] leading-[1.6] relative transition-transform duration-200 group-hover:-translate-y-px ${
                          isMe 
                            ? `bg-indigo-600 text-white border border-indigo-500/50 rounded-[20px] ${showTail ? 'rounded-br-sm' : ''}` 
                            : `bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/50 dark:border-white/5 rounded-[20px] ${showTail ? 'rounded-bl-sm' : ''}`
                        }`}
                      >
                        <p className="break-words font-medium">{msg.content}</p>
                        
                        {msg.file_url && (
                          <div className={`mt-2 rounded-xl overflow-hidden border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-black/20 ${msg.content ? 'pt-2 border-t' : 'border-t-0 mt-0 max-w-[280px]'}`}>
                            <img src={msg.file_url} alt="attachment" className="max-w-full h-auto object-cover rounded-lg transform hover:scale-[1.02] transition-transform duration-300 cursor-zoom-in" loading="lazy" />
                          </div>
                        )}
                        
                        {/* Status indicators */}
                        {isMe && showTail && (
                           <div className="absolute -right-1.5 -bottom-1 text-indigo-600 dark:text-indigo-400 bg-slate-50 dark:bg-slate-950 p-0.5 rounded-full border border-slate-200/50 dark:border-white/5 hidden group-hover:flex shadow-sm transition-colors duration-300">
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-[10px] h-[10px]" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                           </div>
                        )}
                      </div>
                      
                      <span className={`text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity absolute ${isMe ? 'right-1 -bottom-4' : 'left-1 -bottom-4'}`}>
                        {timeString}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} className="h-4 pb-2" />
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-4 md:px-6 md:py-6 bg-gradient-to-t from-slate-50 via-slate-50/95 dark:from-slate-950 dark:via-slate-950/95 to-transparent z-20 relative before:content-[''] before:absolute before:inset-0 before:bg-white/40 dark:before:bg-slate-900/40 before:backdrop-blur-md before:-z-10 before:border-t before:border-slate-200/50 dark:before:border-white/5 transition-colors duration-300">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 relative">
          
          {/* File Upload Hidden Input */}
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
            className="p-3.5 flex-shrink-0 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 hover:text-slate-900 hover:bg-slate-50 dark:hover:text-white dark:hover:bg-slate-700 border border-slate-200/50 dark:border-white/5 rounded-2xl transition-all disabled:opacity-50 shadow-sm"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-500 dark:text-indigo-400" /> : <ImageIcon className="w-5 h-5" />}
          </button>
          
          <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-white/5 flex items-center rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all px-2 shadow-sm">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Message..."
              className="w-full bg-transparent text-[15px] font-medium text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 py-4 px-3 focus:outline-none"
            />
            <button type="button" className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all mr-1">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit" 
            disabled={!content.trim() && !isUploading}
            className="p-4 flex-shrink-0 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 disabled:opacity-50 disabled:bg-slate-200 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:border-slate-200/50 disabled:dark:border-white/5 focus:outline-none shadow-md hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-indigo-500/50"
          >
            <Send className="w-5 h-5 ml-0.5" />
          </button>
        </form>
      </div>
    </Layout>
  );
}
