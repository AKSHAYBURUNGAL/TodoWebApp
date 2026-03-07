# Vercel Deployment Guide - Todo MERN Application

## Overview
This guide explains how to deploy both the backend (Node.js/Express) and frontend (React) to Vercel.

## Prerequisites
- Vercel account (free at https://vercel.com)
- GitHub repository with your code
- MongoDB Atlas account for cloud database

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Build a database and choose M0 (free tier)
5. Set username and password
6. Add IP address (Allow access from anywhere: 0.0.0.0/0)
7. Copy the connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Vercel

### 2.1 Push code to GitHub
```bash
cd /home/akshay/todo-mern
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2.2 Deploy Backend

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select the project root: `/home/akshay/todo-mern`
5. In "Root Directory" settings, set it to `backend/`
6. Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1 |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://your-frontend-domain.vercel.app` (add after frontend deployment) |

7. Click "Deploy"
8. Copy your backend URL (e.g., `https://todo-backend-xxx.vercel.app`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Update Environment Variable

Before deploying, update frontend `.env.production` (create if doesn't exist):

```bash
cd /home/akshay/todo-mern/frontend
echo "REACT_APP_API_URL=https://your-backend-domain.vercel.app/api/todos" > .env.production
```

Replace `your-backend-domain` with your actual backend Vercel domain from Step 2.

### 3.2 Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select the project root: `/home/akshay/todo-mern`
5. In "Root Directory" settings, set it to `frontend/`
6. In "Build and Output Settings":
   - Build Command: `npm run build`
   - Output Directory: `build`
7. Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-backend-domain.vercel.app/api/todos` |

8. Click "Deploy"
9. Copy your frontend URL (e.g., `https://todo-frontend-xxx.vercel.app`)

---

## Step 4: Update Backend CORS Settings

Now update your backend's `FRONTEND_URL` environment variable:

1. Go to backend deployment settings on Vercel
2. Go to "Settings" > "Environment Variables"
3. Update `FRONTEND_URL` to your frontend domain:
   ```
   https://your-frontend-domain.vercel.app
   ```
4. Redeploy backend (click "Deployments" > "Redeploy")

---

## Step 5: Test Your Deployment

1. Open your frontend URL in your browser
2. Try creating a todo
3. Try marking it complete
4. Try viewing daily/weekly/monthly tasks
5. Check analytics dashboard

### If you see CORS errors:
- Open browser DevTools (F12)
- Go to Console tab
- Look for error messages
- Common issues:
  - Frontend URL doesn't match CORS origin in backend
  - API URL is incorrect in frontend environment variables
  - Backend not redeployed after CORS update

---

## Troubleshooting

### "Failed to fetch todos" on different browsers/devices
- **Cause**: CORS issue or API URL mismatch
- **Fix**: Verify `FRONTEND_URL` in backend environment variables matches your deployed frontend URL

### "Cannot save tasks"
- **Cause**: Backend API URL in frontend is incorrect
- **Fix**: Check `REACT_APP_API_URL` in frontend environment variables

### "Works on one browser but not another"
- **Cause**: Browser cache or different origin
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R), clear browser cache, or use incognito mode

### MongoDB connection error
- **Cause**: IP whitelist or connection string wrong
- **Fix**: 
  - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
  - Check connection string is correct in environment variables
  - Verify database name is "todoapp"

---

## Environment Variables Summary

### Backend (.env and Vercel)
```
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/todoapp
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

### Frontend (.env.local and Vercel)
```
REACT_APP_API_URL=https://your-backend.vercel.app/api/todos
```

---

## File Structure for Vercel

```
todo-mern/
├── backend/
│   ├── vercel.json          ✅ (Vercel config)
│   ├── .vercelignore        ✅ (Ignore files)
│   ├── server.js
│   ├── package.json
│   ├── .env                 (LOCAL ONLY - not pushed)
│   └── .env.example         (Template)
│
├── frontend/
│   ├── .vercelignore        ✅ (Ignore files)
│   ├── package.json
│   ├── .env.local           (LOCAL ONLY - not pushed)
│   ├── .env.example         (Template)
│   ├── .env.production      (Template for prod - can be created in Vercel UI)
│   ├── src/
│   └── public/
│
├── .gitignore               ✅ (Prevents pushing node_modules, .env)
└── README.md
```

---

## Quick Deploy Checklist

- [ ] MongoDB Atlas setup complete with connection string
- [ ] Backend pushed to GitHub
- [ ] Backend deployed to Vercel with MONGODB_URI and NODE_ENV env vars
- [ ] Frontend `.env.production` updated with backend URL
- [ ] Frontend pushed to GitHub
- [ ] Frontend deployed to Vercel with REACT_APP_API_URL env var
- [ ] Backend redeployed with FRONTEND_URL env var
- [ ] Test in multiple browsers ✅
- [ ] Test on mobile device ✅
- [ ] Test create/read/update/delete operations ✅

---

## Support

If you face any issues:
1. Check browser console (F12) for error messages
2. Check Vercel deployment logs (Deployments > Build Logs)
3. Check Vercel function logs (Functions > Logs)
4. Verify all environment variables are set correctly
5. Clear browser cache and try again

Happy deploying! 🚀
