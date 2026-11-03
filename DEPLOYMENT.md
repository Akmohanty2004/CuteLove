# 🚀 Ashis & Kirti Love Space — Deployment Guide

This guide provides simple, step-by-step instructions to deploy the **Ashis & Kirti Private Love Sanctuary** online so you and your partner can access it from any phone or computer 24/7!

---

## 🌟 Option 1: Recommended — 1-Click Full-Stack Deployment on Render (Easiest)
Render hosts both your Node.js backend and Vite React frontend together with full Socket.IO support on their free or starter tier.

### Step 1: Push your project to GitHub
1. Initialize git (if not already done) and push to your private or public GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Ashis & Kirti Love Sanctuary Ready for Production"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ashis-kirti-love-space.git
   git push -u origin main
   ```

### Step 2: Set up Free MongoDB Atlas Database
1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and sign up / log in.
2. Create a free **M0 Shared Cluster**.
3. In **Database Access**, create a database user (e.g., username `ashis` and a secure password).
4. In **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** ➔ **Drivers** (Node.js) ➔ copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/ashis_kirti_love?retryWrites=true&w=majority
   ```

### Step 3: Deploy on Render
1. Go to [render.com](https://render.com) and log in with your GitHub account.
2. Click **New +** ➔ **Web Service**.
3. Select your GitHub repository (`ashis-kirti-love-space`).
4. Configure the settings:
   - **Name**: `ashis-kirti-love`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Build Command**: `npm run postinstall && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string from Step 2*
   - `JWT_ACCESS_SECRET`: `ashis_kirti_super_secret_access_key_2026_romantic_love_space`
   - `JWT_REFRESH_SECRET`: `ashis_kirti_super_secret_refresh_key_2026_forever_session`
   - *(Optional)* `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for cloud media uploads.
6. Click **Create Web Service**.
7. Once deployed, Render will give you a live URL like `https://ashis-kirti-love.onrender.com`!

---

## 🚂 Option 2: Deploy on Railway (Ultra-Fast)
1. Go to [railway.app](https://railway.app).
2. Click **New Project** ➔ **Deploy from GitHub Repo**.
3. Select your repo.
4. Add the Environment Variables (`MONGODB_URI`, `NODE_ENV=production`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`).
5. Railway will automatically detect Node.js, run `npm run build`, and launch `npm start`.
6. Under Settings ➔ Networking, click **Generate Domain**.

---

## ⚡ Option 3: Split Deployment (Vercel Frontend + Render Backend)
- **Frontend on Vercel**:
  - Connect GitHub repo, set Root Directory to `client`.
  - Add Environment Variable: `VITE_API_URL=https://your-backend.onrender.com`
  - Add Environment Variable: `VITE_SOCKET_URL=https://your-backend.onrender.com`
- **Backend on Render**:
  - Set Root Directory to `server`.
  - Set `CLIENT_URL=https://your-frontend.vercel.app`.

---

## 📱 How to Install as an App on Phones (PWA)
Once your live link is running:
- **iPhone (Safari)**: Open your URL ➔ Tap the **Share** button ➔ Tap **Add to Home Screen**.
- **Android (Chrome)**: Open your URL ➔ Tap the **Three Dots** ➔ Tap **Install App** or **Add to Home screen**.

Now Ashis and Kirti have their own dedicated private couple app right on their phone home screens! 💍❤️
