# Deployment Setup Guide

This document outlines the three-step deployment process for your MERN application.

## Overview
- **Database**: MongoDB Atlas (Cloud)
- **Backend**: Render (Node.js API)
- **Frontend**: Vercel (React App)

---

## 1️⃣ MongoDB Atlas Setup (Database)

### Steps:
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free cluster
3. Go to **Network Access** → Add IP → Add `0.0.0.0/0` (allows all IPs)
4. Go to **Database Access** → Create a database user with password
5. Get your connection string:
   - Format: `mongodb+srv://user:password@cluster.mongodb.net/dbname`
   - Replace `user`, `password`, and `dbname` with your values

**Copy this connection string** - you'll need it for Render.

---

## 2️⃣ Render Deployment (Backend)

### Prerequisites:
- Your code pushed to GitHub
- MongoDB connection string from Atlas

### Steps:

1. Go to [render.com](https://render.com) and sign up
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure deployment settings:
   - **Name**: `todo-api` (or your choice)
   - **Root Directory**: `backend` (the folder containing your Node.js code)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node
   - **Instance Type**: Free

5. Add Environment Variables:
   ```
   MONGODB_URI = mongodb+srv://user:password@cluster.mongodb.net/dbname
   PORT = 5000
   ```

6. Click **Deploy**
7. Wait for deployment to complete
8. **Copy your Render URL** - it will look like: `https://your-api.onrender.com`

---

## 3️⃣ Vercel Deployment (Frontend)

### Prerequisites:
- Your code pushed to GitHub
- Render backend URL from previous step

### Steps:

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Import Project** → select your repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add Environment Variables:
   ```
   REACT_APP_API_URL = https://your-api.onrender.com/api/todos
   ```
   Replace `your-api` with your actual Render subdomain.

6. Click **Deploy**
7. Your app will be live at your Vercel URL!

---

## Verification

After deployment:

1. **Test Backend**:
   ```bash
   curl https://your-api.onrender.com/api/todos
   ```

2. **Check Frontend**:
   - Open your Vercel URL in browser
   - Open DevTools Console → check for any errors
   - Try adding/editing/deleting a todo
   - Check Network tab to verify API calls go to your Render URL

---

## Environment Variables Summary

### Backend (.env on Render)
```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/dbname
PORT=5000
```

### Frontend (.env on Vercel)
```
REACT_APP_API_URL=https://your-api.onrender.com/api/todos
```

---

## Troubleshooting

### Backend won't connect to MongoDB
- Check MONGODB_URI is correct
- Verify Network Access in MongoDB Atlas allows `0.0.0.0/0`
- Check database user credentials

### Frontend can't reach backend
- Verify `REACT_APP_API_URL` env var is set in Vercel
- Check backend is running (visit the Render URL in browser)
- Check CORS is enabled in backend (it is by default)

### Render/Vercel shows deploy error
- Check logs in dashboard
- Verify build commands are correct
- Ensure all dependencies are in package.json
