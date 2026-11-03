# 🌹 Ashis & Kirti — Private Couple Memory Space

An exclusive, two-person private memory sanctuary built on the **MERN** stack, designed exclusively for **Ashis** and **Kirti** to celebrate their journey, sync their emotions in real time, and preserve precious memories with uninterrupted access.

---

## ✨ Key Features & Architecture

### 1. 🔒 30-Day Login Persistence (Monthly Cycle)
- **HTTP-Only, Secure Cookies**: Issues a JWT access and refresh token with a 30-day lifetime.
- **Silent Renewal**: Background token refresh ensures neither Ashis nor Kirti is prompted to log in again until the 30 days naturally expire.
- **Session Remaining Indicator**: Settings & Navbar display a gentle countdown (e.g. `Session: 30 days left`) with a one-click manual renewal option.
- **Explicit Fixed Identities**: Registry is restricted strictly to `ashis` and `kirti`.

### 2. 💖 Animated Welcome Screen
- On every application launch, a full-screen romantic overlay welcomes the couple with rotating personalized quotes (*"Welcome to our world, Ashis and Kirti ✨"*, *"Every love story is beautiful, but ours is my favorite ❤️"*).
- Gracefully transitions in and out using **Framer Motion's** `AnimatePresence`.

### 3. ⚡ Realistic Full-Screen Mood & Atmosphere Engine
- **4 Cinematic Realistic Weather & Lighting Modes**:
  - **Happy Mode (😊)**: Radiant god rays & sunbeams, golden light bokeh, and realistic drifting cherry blossom flower petals with warm champagne gold cards.
  - **Sad Mode (🥺)**: Realistic streaming raindrops falling against the screen, window condensation droplets, misty midnight indigo sky, and frosted slate glassmorphism.
  - **Gussa Mode (😤)**: Realistic rising fiery embers, hot sparks with glowing heat trails, molten crimson-orange magma glow, and dark obsidian cards.
  - **Normal Mode (😌)**: Bioluminescent glowing fireflies with organic pulsing auras drifting through an enchanted moonlit emerald breeze.
- **Synthesized Ambient Audio (Zero-Download AudioContext)**:
  - An interactive Ambience sound toggle in the navbar plays realistic synthesized soundscapes on demand (*Raindrops for Sad, Fireplace Crackles for Gussa, Warm Chimes for Happy, Forest Breeze for Normal*).
- **Instant Dual-Side Sync via Socket.IO**: Whenever Ashis or Kirti changes their mood, **both screens transform together immediately**!

### 4. 📸 Memory Vault & Dashboard Feed
- **Private By Default**: Uploaded photos and videos are stored privately in the **Memory Vault**.
- **Dashboard Visibility Toggle**: Only when toggled to *"Show on Dashboard"* does a memory appear on the shared home feed.
- **Cloudinary Media Storage**: Direct CDN upload for images and videos with automatic format & quality optimization, plus a seamless local disk fallback for zero-friction setup.
- **Memories of the Day Flashback**: 4-photo collage celebrating random nostalgic moments from the past.

### 5. 💬 High-Speed Real-Time Couple Chat & Widgets
- **Sub-Millisecond Real-Time Couple Chat**:
  - Instant optimistic UI sending (0ms latency).
  - Socket.IO live broadcast with typing indicator (*"{Partner} is typing... ✍️"*).
  - Quick love burst buttons for 1-tap sweet sentiments with floating confetti bursts.
  - Dedicated Chat tab in the top navigation + persistent floating quick launcher button.
- **Dynamic Mood-Morphing Feed Images**:
  - Feed cards & photos dynamically morph their shape, glowing borders, and visual tone to match the active mood:
    - **Happy**: Blossom petal organic shape (`rounded-[2.5rem] rounded-tr-[1.25rem]`), golden sunlit specular highlight border (`border-amber-300`), warm luminous filter.
    - **Normal**: Serene jade pebble curved shape (`rounded-[2.25rem] rounded-tl-[1rem]`), tranquil emerald glow.
    - **Sad**: Teardrop raindrop ripple shape (`rounded-t-[3.5rem] rounded-b-2xl`), deep ocean blue glass, cyan rim lighting.
    - **Gussa**: Angular magma shape (`rounded-3xl rounded-tl-sm`), molten ruby pulsing glow, fiery filter.
  - Double-click / double-tap photo to heart with floating pop animation.
  - Shimmer light sweep across photo on hover.
- **Secret Sticky Notes**: Pinned notes with pastel colors (rose, amber, emerald, indigo, violet) that sync live over Socket.IO with a typing indicator.
- **Anniversary Live Counter (Start Date: 10/09/2020)**: Real-time ticker counting exact Years, Months, Days, Hours, Minutes, and pulsing Seconds together since September 10, 2020.
- **PWA Ready**: Web app manifest (`manifest.json`) and service worker (`sw.js`) enabling full-screen standalone installation on mobile phones.

---

## 🚀 Quick Start Guide

### 1. Pre-requisites
- **Node.js**: v18 or later
- **MongoDB**: Installed locally (or a MongoDB Atlas connection string)

### 2. Installation
Dependencies are already installed in root, server, and client. If needed in a fresh clone:
```bash
npm install
cd server && npm install
cd ../client && npm install
cd ..
```

### 3. Pre-Seeded Couple Credentials & Single-Password Login
The login page has a **single, unified password section**. There is no need to select Ashis or Kirti:
- Enter Ashis's password (`ashis123`) ➔ The app automatically recognizes **Ashis** and opens his dashboard.
- Enter Kirti's password (`kirti123`) ➔ The app automatically recognizes **Kirti** and opens her dashboard.

| Partner | Password | Auto-Detected Identity |
| :--- | :--- | :--- |
| **Ashis** | `ashis123` | Logged in as Ashis (Partner: Kirti) |
| **Kirti** | `kirti123` | Logged in as Kirti (Partner: Ashis) |

### 4. Running the Application
To run both backend and frontend concurrently:
```bash
npm run dev
```

Or run them individually:
```bash
# Start backend server (Port 5000)
npm run server

# Start frontend (Port 5173)
npm run client
```

Open your browser at **`http://localhost:5173`**.

---

## ⚙️ Environment Configuration

Both `.env` in the root and `server/.env` contain:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ashis_kirti_love
JWT_ACCESS_SECRET=ashis_kirti_super_secret_access_key_2026_romantic_love_space
JWT_REFRESH_SECRET=ashis_kirti_super_secret_refresh_key_2026_forever_session
CLIENT_URL=http://localhost:5173
NODE_ENV=development

# Cloudinary (Optional - local fallback storage active if left blank)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 📂 Project Structure

```
Love/
├── server/
│   ├── config/
│   │   ├── db.js             # Mongoose connection & pre-seeding
│   │   └── cloudinary.js     # Cloudinary media config + fallback
│   ├── controllers/
│   │   ├── authController.js   # 30-day session login & refresh logic
│   │   ├── memoryController.js # Vault & feed CRUD
│   │   ├── moodController.js   # Mood updates & 24h timeline
│   │   ├── messageController.js # Real-time couple chat
│   │   └── noteController.js   # Sticky notes CRUD
│   ├── middleware/
│   │   └── authMiddleware.js # HTTP-Only cookie verification
│   ├── models/
│   │   ├── User.js           # Ashis & Kirti schema
│   │   ├── Memory.js         # Media vault & feed schema
│   │   ├── MoodLog.js        # Timeline history schema
│   │   ├── Message.js        # Real-time messages schema
│   │   └── Note.js           # Secret sticky notes schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── memoryRoutes.js
│   │   ├── moodRoutes.js
│   │   ├── messageRoutes.js
│   │   └── noteRoutes.js
│   ├── socket/
│   │   └── socketHandler.js  # Real-time room, mood sync, & cheer alerts
│   └── index.js
├── client/
│   ├── public/
│   │   ├── manifest.json     # PWA standalone manifest
│   │   ├── sw.js             # Service worker
│   │   └── heart.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── axiosClient.js # Axios with auto 30-day token refresh
│   │   ├── components/
│   │   │   ├── WelcomeScreen.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── MoodSelector.jsx
│   │   │   ├── CheerUpBanner.jsx
│   │   │   ├── MoodChart.jsx
│   │   │   ├── MemoryUploader.jsx
│   │   │   ├── DashboardFeed.jsx
│   │   │   ├── MemoryVault.jsx
│   │   │   ├── StickyNoteWidget.jsx
│   │   │   ├── AnniversaryWidget.jsx
│   │   │   ├── MemoryOfTheDay.jsx
│   │   │   ├── RealtimeChat.jsx
│   │   │   ├── RealisticAtmosphere.jsx
│   │   │   ├── LoveReactions.jsx
│   │   │   └── SettingsModal.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   │   ├── useMemories.js
│   │   │   └── useMoods.js
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   └── DashboardPage.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── tailwind.config.js
└── package.json
```
