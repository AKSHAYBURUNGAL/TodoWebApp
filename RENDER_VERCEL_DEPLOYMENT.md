# Render + Vercel Deployment Checklist

Complete deployment of your MERN Todo app in 3 platforms.

---

## ✅ Pre-Deployment Checklist

- [ ] Code is committed and pushed to GitHub
- [ ] All dependencies are in `package.json` (frontend & backend)
- [ ] `.gitignore` includes `.env` (don't commit secrets)
- [ ] `.env.example` files exist showing required variables

---

## 📦 Step 1: MongoDB Atlas (Database Setup)

### 1.1 Create MongoDB Cluster
- [ ] Go to [mongodb.com/atlas](https://mongodb.com/atlas)
- [ ] Sign up/Log in
- [ ] Create new free cluster
- [ ] Wait for cluster to deploy (5-10 minutes)

### 1.2 Set Network Access
- [ ] Go to **Network Access** → **Add IP Address**
- [ ] Click **Allow Access from Anywhere** → Add `0.0.0.0/0`
- [ ] Confirm

### 1.3 Create Database User
- [ ] Go to **Database Access** → **Add New Database User**
- [ ] Username: Create a strong username
- [ ] Password: Create a strong password (save both!)
- [ ] Database User Privileges: `Read and write to any database`
- [ ] Click **Create User**

### 1.4 Get Connection String
- [ ] Go to **Databases** → Click **Connect** on your cluster
- [ ] Select **Drivers** → Node.js
- [ ] Copy the connection string
- [ ] Replace `<username>`, `<password>`, and `<dbname>` with your values
- [ ] **Save this** - you'll need it for Render

**Example:**
```
mongodb+srv://akshay:MySecurePass123@cluster0.mongodb.net/todoapp
```

---

## 🚀 Step 2: Render Backend Deployment

### 2.1 Prepare Code
- [ ] Code pushed to GitHub
- [ ] Backend structure: `/backend` folder with `server.js` and `package.json`
- [ ] `package.json` has `"start": "node server.js"` script
- [ ] CORS enabled in backend (already done in your code)

### 2.2 Create Render Account
- [ ] Go to [render.com](https://render.com)
- [ ] Sign up with GitHub
- [ ] Grant GitHub access

### 2.3 Create Web Service
- [ ] Click **New** → **Web Service**
- [ ] Select your GitHub repository
- [ ] Click **Connect**

### 2.4 Configure Deployment
**Basic Settings:**
- [ ] **Name**: `todo-api` (or similar)
- [ ] **Root Directory**: `backend`
- [ ] **Runtime**: Node
- [ ] **Build Command**: `npm install`
- [ ] **Start Command**: `node server.js`
- [ ] **Instance Type**: Free (if available)

### 2.5 Add Environment Variables
- [ ] Click **Environment** → **Add from .env file** or manually add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/dbname` |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

- [ ] Click **Deploy**
- [ ] Wait for deployment to complete (2-5 minutes)
- [ ] Check logs to verify: `✓ MongoDB connected successfully`

### 2.6 Save Render URL
- [ ] Copy your Render API URL
- [ ] Format: `https://your-api.onrender.com`
- [ ] **Save this** - you'll need it for Vercel

---

## 🎨 Step 3: Vercel Frontend Deployment

### 3.1 Prepare Code
- [ ] Code pushed to GitHub
- [ ] Frontend structure: `/frontend` folder with `package.json` and `src/`
- [ ] `frontend/package.json` has `"build": "react-scripts build"` script
- [ ] API URL in code uses `process.env.REACT_APP_API_URL`

### 3.2 Create Vercel Account
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign up with GitHub
- [ ] Grant GitHub access

### 3.3 Import Project
- [ ] Click **Import Project**
- [ ] Select your GitHub repository
- [ ] Click **Import**

### 3.4 Configure Build Settings
**Framework & Directory:**
- [ ] **Project Name**: `todo-app` (or similar)
- [ ] **Root Directory**: `frontend`
- [ ] **Framework Preset**: Next.js (or leave blank)
- [ ] **Build Command**: `npm run build`
- [ ] **Output Directory**: `build`

### 3.5 Add Environment Variables
- [ ] Scroll to **Environment Variables**
- [ ] Add new variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-api.onrender.com/api/todos` |

Replace `your-api` with your actual Render subdomain!

- [ ] Click **Deploy**
- [ ] Wait for deployment to complete (2-3 minutes)
- [ ] Check deployment logs for any errors

### 3.6 Save Vercel URL
- [ ] Copy your Vercel URL
- [ ] Format: `https://your-project-name.vercel.app`
- [ ] This is your live app!

---

## ✨ Testing Your Deployment

### Test Backend (Render)
```bash
# In your terminal, test the API
curl https://your-api.onrender.com/api/todos

# Should return an empty array: []
```

### Test Frontend (Vercel)
- [ ] Open your Vercel URL in browser
- [ ] Open Developer Tools → Console tab
- [ ] Look for any error messages
- [ ] Try creating a new todo
- [ ] Check **Network** tab → Filter by XHR
- [ ] Verify API calls go to `https://your-api.onrender.com`

### Full Integration Test
- [ ] Create a todo in frontend
- [ ] Check it appears immediately
- [ ] Refresh page → todo still there
- [ ] Edit a todo → updates work
- [ ] Delete a todo → removed from both
- [ ] Check Render logs for MongoDB activity

---

## 🔧 Common Issues & Solutions

### ❌ Frontend shows error: "Cannot POST /api/todos"
**Solution:** 
- [ ] Check `REACT_APP_API_URL` is set in Vercel env vars
- [ ] Verify Render URL is correct and doesn't have trailing slash
- [ ] Make sure Render backend is actually running

### ❌ "MONGODB_URI is not set" error in Render
**Solution:**
- [ ] Check environment variable name is exactly `MONGODB_URI`
- [ ] Verify connection string is correctly formatted
- [ ] Restart deployment in Render

### ❌ MongoDB connection fails
**Solution:**
- [ ] Check Network Access in MongoDB Atlas includes `0.0.0.0/0`
- [ ] Verify username/password in connection string
- [ ] Check database name exists

### ❌ Frontend still uses old API URL after deployment
**Solution:**
- [ ] Redeploy Vercel (it should auto-detect env var changes)
- [ ] Trigger a redeployment by pushing a new commit
- [ ] Clear browser cache (Ctrl+Shift+Delete)

### ❌ Render shows "Build failed"
**Solution:**
- [ ] Check logs in Render dashboard
- [ ] Verify `package.json` exists in backend folder
- [ ] Ensure all dependencies can be installed: `npm install`
- [ ] Check `server.js` file exists

---

## 🎯 Quick Links

- **MongoDB Atlas**: https://mongodb.com/atlas
- **Render**: https://render.com
- **Vercel**: https://vercel.com

---

## 📝 Credentials to Save

**Backup these securely:**

```
MongoDB Atlas:
- Email: [your-email]
- User: [your-username]
- Password: [saved-password]
- Cluster: [cluster-name]
- Connection String: mongodb+srv://...

Render:
- Backend URL: https://your-api.onrender.com
- Start/Stop: Render dashboard

Vercel:
- Frontend URL: https://your-project.vercel.app
- Deployment: Vercel dashboard
```

---

## 🚀 Next Steps

After successful deployment:
- [ ] Share your live URL with others
- [ ] Monitor Render logs for errors
- [ ] Monitor Vercel analytics
- [ ] Set up Render cron job if needed (for maintenance)
- [ ] Consider upgrading from free tier when needed

---

**Need help? Check the logs in each platform's dashboard first!**
