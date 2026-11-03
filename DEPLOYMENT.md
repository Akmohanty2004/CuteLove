# 🚀 Ashis & Kirti Love Space — Deployment Guide

This guide provides simple, step-by-step instructions to deploy the **Ashis & Kirti Private Love Sanctuary** online so you and your partner can access it from any phone or computer 24/7!

---

## 🌟 Option 1: Recommended — 1-Click Full-Stack Deployment on Render (Easiest)
Render hosts both your Node.js backend and Vite React frontend together with full Socket.IO support on their free or starter tier.

### Step 1: Push your project to GitHub
The repository is set to:
```bash
git push -u origin main
```

### Step 2: Cloud MongoDB Atlas & Cloudinary (Already Connected!)
Your cloud database cluster and Cloudinary assets are already connected. The connection credentials:
- **MongoDB Cluster**: `mongodb+srv://ashiskumarmohanty738_db_user:2Y6an584ova2sOA3@cutelove.h49ssfg.mongodb.net/ashis_kirti_love?retryWrites=true&w=majority`
- **Cloudinary**: Cloud `loomup4w`, Key `432814473974211`

### Step 3: Deploy on Render
1. Go to [render.com](https://render.com) and log in with your GitHub account (`Akmohanty2004`).
2. Click **New +** ➔ **Web Service**.
3. Select your GitHub repository (`CuteLove`).
4. Configure the settings:
   - **Name**: `cutelove`
   - **Environment**: `Node`
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Build Command**: `npm run postinstall && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `mongodb+srv://ashiskumarmohanty738_db_user:2Y6an584ova2sOA3@cutelove.h49ssfg.mongodb.net/ashis_kirti_love?retryWrites=true&w=majority`
   - `JWT_ACCESS_SECRET`: `ashis_kirti_super_secret_access_key_2026_romantic_love_space`
   - `JWT_REFRESH_SECRET`: `ashis_kirti_super_secret_refresh_key_2026_forever_session`
   - `ASHIS_PASSWORD`: `Ashis0710`
   - `KIRTI_PASSWORD`: `Kirti1210`
   - `CLOUDINARY_CLOUD_NAME`: `loomup4w`
   - `CLOUDINARY_API_KEY`: `432814473974211`
   - `CLOUDINARY_API_SECRET`: `uFt23dCTIJszTjFRH25UNaylv-o`
6. Click **Create Web Service**.
7. Once deployed, Render will give you a live URL like `https://cutelove.onrender.com`!

---

## 📱 How to Install as an App on Phones (PWA)
Once your live link is running:
- **iPhone (Safari)**: Open your URL ➔ Tap the **Share** button ➔ Tap **Add to Home Screen**.
- **Android (Chrome)**: Open your URL ➔ Tap the **Three Dots** ➔ Tap **Install App** or **Add to Home screen**.

Now Ashis and Kirti have their own dedicated private couple app right on their phone home screens! 💍❤️
