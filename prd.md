📄 PRODUCT REQUIREMENTS DOCUMENT (React + Supabase)
🧩 1. Product Overview

Product Name: BitChat

Description:
A modern real-time messaging web app where users can:

Sign up / log in
Add friends via email or phone
Send/receive messages instantly
Share images, videos, and voice messages
🎯 2. Goals
Primary Goals
⚡ Real-time chat (instant delivery)
📁 Media sharing (image/video/audio)
👥 Friend-based messaging system
Secondary Goals
Clean, responsive UI
Secure authentication
Scalable architecture
🏗️ 3. Tech Stack
Frontend
React (Vite)
TypeScript
Tailwind CSS (recommended)
Backend (BaaS)
Supabase
PostgreSQL DB
Auth
Realtime
Storage
🧠 4. System Architecture
React App (Frontend)
     ↓
Supabase Client SDK
     ↓
-------------------------
| Auth | DB | Storage   |
| Realtime (WebSocket)  |
-------------------------

👉 No custom backend needed 😎

🗃️ 5. Database Schema (Supabase)
👤 users (handled by Supabase Auth)

Supabase already provides:

id (UUID)
email
password
👥 profiles
id UUID PRIMARY KEY REFERENCES auth.users(id),
name TEXT,
phone TEXT,
avatar_url TEXT,
created_at TIMESTAMP DEFAULT NOW()
🤝 friend_requests
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
sender_id UUID,
receiver_id UUID,
status TEXT CHECK (status IN ('pending','accepted','rejected')),
created_at TIMESTAMP DEFAULT NOW()
👬 friends
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
user1 UUID,
user2 UUID,
created_at TIMESTAMP DEFAULT NOW()
💬 messages
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
sender_id UUID,
receiver_id UUID,
content TEXT,
file_url TEXT,
type TEXT CHECK (type IN ('text','image','video','audio')),
created_at TIMESTAMP DEFAULT NOW()
🔐 6. Authentication Flow

Handled by Supabase:

Signup
await supabase.auth.signUp({
  email,
  password
});
Login
await supabase.auth.signInWithPassword({
  email,
  password
});
🤝 7. Friend System
Send Request
Search user by email/phone
Insert into friend_requests
Accept Request
Update status → accepted
Insert into friends
💬 8. Real-Time Messaging (CORE)
Send Message
await supabase.from('messages').insert({
  sender_id,
  receiver_id,
  content: message,
  type: 'text'
});
Listen for Messages (REAL-TIME)
supabase
  .channel('chat')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    setMessages(prev => [...prev, payload.new]);
  })
  .subscribe();

👉 This is instant ⚡ (WebSocket under the hood)

📁 9. Media Upload System
Upload File
const { data } = await supabase.storage
  .from('chat-files')
  .upload(`public/${file.name}`, file);
Get Public URL
const { data: url } = supabase.storage
  .from('chat-files')
  .getPublicUrl(data.path);
Save in Message
await supabase.from('messages').insert({
  sender_id,
  receiver_id,
  file_url: url.publicUrl,
  type: 'image'
});
🎨 10. UI Structure
Pages
🔑 Auth
Login
Signup
🏠 Dashboard
Sidebar (friends)
Search users
Friend requests
💬 Chat Page
Chat header (user info)
Messages list
Input box
Upload button
Voice record button
⚙️ 11. State Management

Recommended:

Zustand (lightweight) OR
React Context
🔒 12. Security (IMPORTANT)
Supabase RLS (Row Level Security)

Example:

CREATE POLICY "Users can see their messages"
ON messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

👉 Without RLS = insecure ❌

⚡ 13. Performance Requirements
Message delay: < 500ms
Smooth UI updates
Lazy loading chat history
🚀 14. Advanced Features (Phase 2+)
✅ Typing indicator
✅ Online/offline status
✅ Read receipts (✔✔)
✅ Push notifications
✅ Group chat
✅ Voice/video call (WebRTC)
🧪 15. Testing
Auth flow
Message delivery
Media upload
Edge cases (disconnect, retry)
📦 16. Deployment
Frontend
Vercel / Netlify
Backend
Supabase (already hosted)
🧠 17. Folder Structure (React)
src/
 ├── components/
 ├── pages/
 ├── hooks/
 ├── store/
 ├── lib/
 │    supabase.ts
 ├── types/
 └── App.tsx
💥 Final Reality Check

This stack is very powerful:

👉 No PHP needed
👉 No MySQL needed
👉 No WebSocket server needed

Supabase handles everything.