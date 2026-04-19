import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Profile {
  id: string;
  name: string;
  avatar_url?: string;
  online_status?: boolean;
}

export interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  file_url?: string;
  type: 'text' | 'image' | 'video' | 'audio';
  created_at: string;
}

interface ChatState {
  friends: Profile[];
  pendingRequests: Profile[];
  exploreUsers: Profile[];
  messages: Message[];
  loading: boolean;
  activeChat: Profile | null;
  fetchFriends: (userId: string) => Promise<void>;
  fetchMessages: (userId: string, friendId: string) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'created_at'>) => Promise<void>;
  setActiveChat: (profile: Profile | null) => void;
  sendFriendRequest: (userId: string, friendId: string) => Promise<void>;
  acceptFriendRequest: (userId: string, friendId: string) => Promise<void>;
  rejectFriendRequest: (userId: string, friendId: string) => Promise<void>;
  subscribeToMessages: (userId: string, friendId: string) => () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  friends: [],
  pendingRequests: [],
  exploreUsers: [],
  messages: [],
  loading: false,
  activeChat: null,

  fetchFriends: async (userId) => {
    const { data: friendships } = await supabase
      .from('friendships')
      .select('*')
      .or(`user_id.eq.${userId},friend_id.eq.${userId}`);

    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', userId);

    if (profiles && friendships) {
      const acceptedFriendIds = new Set<string>();
      const pendingReceivedIds = new Set<string>();
      const pendingSentIds = new Set<string>();

      friendships.forEach(f => {
        if (f.status === 'accepted') {
          acceptedFriendIds.add(f.user_id === userId ? f.friend_id : f.user_id);
        } else if (f.status === 'pending') {
          if (f.friend_id === userId) {
            pendingReceivedIds.add(f.user_id);
          } else {
            pendingSentIds.add(f.friend_id);
          }
        }
      });

      const friends = profiles.filter(p => acceptedFriendIds.has(p.id));
      const pendingRequests = profiles.filter(p => pendingReceivedIds.has(p.id));
      const exploreUsers = profiles.filter(p => 
        !acceptedFriendIds.has(p.id) && 
        !pendingReceivedIds.has(p.id) && 
        !pendingSentIds.has(p.id)
      );

      set({ friends, pendingRequests, exploreUsers });
    }
  },

  fetchMessages: async (userId, friendId) => {
    set({ loading: true });
    
    // Fetch conversation between userId and friendId
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${friendId}),and(sender_id.eq.${friendId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
      
    if (!error && data) {
      set({ messages: data });
    }
    set({ loading: false });
  },

  sendMessage: async (message) => {
    const { data: newMessage, error } = await supabase
      .from('messages')
      .insert([message])
      .select()
      .single();
      
    if (error) {
      console.error('Error sending message:', error);
    } else if (newMessage) {
      set((state) => {
        // Check if realtime subscription already added it to prevent duplicates
        if (!state.messages.some(m => m.id === newMessage.id)) {
          return { messages: [...state.messages, newMessage] };
        }
        return state;
      });
    }
  },

  setActiveChat: (profile) => set({ activeChat: profile }),

  sendFriendRequest: async (userId, friendId) => {
    await supabase.from('friendships').insert([
      { user_id: userId, friend_id: friendId, status: 'pending' }
    ]);
    get().fetchFriends(userId);
  },

  acceptFriendRequest: async (userId, friendId) => {
    await supabase.from('friendships')
      .update({ status: 'accepted' })
      .match({ user_id: friendId, friend_id: userId });
    get().fetchFriends(userId);
  },

  rejectFriendRequest: async (userId, friendId) => {
    await supabase.from('friendships')
      .update({ status: 'rejected' })
      .match({ user_id: friendId, friend_id: userId });
    get().fetchFriends(userId);
  },

  subscribeToMessages: (userId, friendId) => {
    const channel = supabase
      .channel('chat_channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
      }, (payload) => {
        const newMessage = payload.new as Message;
        // Check if the message is relevant to the current active chat
        if (
          (newMessage.sender_id === userId && newMessage.receiver_id === friendId) ||
          (newMessage.sender_id === friendId && newMessage.receiver_id === userId)
        ) {
          set((state) => ({ messages: [...state.messages, newMessage] }));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));
