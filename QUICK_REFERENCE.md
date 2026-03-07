# Quick Reference - Environment Variables

## For Development (Local)

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/todoapp
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api/todos
```

---

## For Production (Vercel)

### Backend Environment Variables (Vercel Dashboard)
| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/todoapp` |
| `NODE_ENV` | `production` | `production` |
| `FRONTEND_URL` | Your Vercel frontend URL | `https://todo-frontend-xyz.vercel.app` |
| `PORT` | `5000` (or leave empty for auto) | `5000` |

### Frontend Environment Variables (Vercel Dashboard)
| Variable | Value | Example |
|----------|-------|---------|
| `REACT_APP_API_URL` | Your Vercel backend API URL | `https://todo-backend-xyz.vercel.app/api/todos` |

---

## Deployment URLs Format

```
Backend Vercel URL:
https://[project-name]-backend-[random-id].vercel.app

Frontend Vercel URL:
https://[project-name]-frontend-[random-id].vercel.app

Backend API Full URL:
https://[project-name]-backend-[random-id].vercel.app/api/todos
```

---

## Steps to Deploy

### Step 1: Push to GitHub
```bash
cd /home/akshay/todo-mern
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy Backend
1. Go to https://vercel.com/new
2. Select GitHub repository
3. Set Root Directory to `backend/`
4. Add Environment Variables (see table above)
5. Deploy!
6. Copy your backend URL

### Step 3: Update Frontend
Update `frontend/.env.production`:
```env
REACT_APP_API_URL=https://your-backend-url-from-step2/api/todos
```

### Step 4: Deploy Frontend
1. Go to https://vercel.com/new
2. Select GitHub repository
3. Set Root Directory to `frontend/`
4. Add Environment Variables (see table above)
5. Deploy!
6. Copy your frontend URL

### Step 5: Update Backend CORS
1. Go to Backend project on Vercel
2. Settings → Environment Variables
3. Update `FRONTEND_URL` to your frontend URL from Step 4
4. Click "Deployments" → "Redeploy"

---

## Testing After Deployment

Open your browser to the frontend URL and test:

```
Create Task: ✓
Update Task: ✓
Delete Task: ✓
Mark Complete: ✓
View Daily: ✓
View Weekly: ✓
View Monthly: ✓
Analytics: ✓
Test on Phone: ✓
Test in Other Browser: ✓
```

---

## MongoDB Atlas Setup

1. Create account: https://www.mongodb.com/cloud/atlas
2. Create cluster (free M0 tier)
3. Create database user with strong password
4. Add IP whitelist: `0.0.0.0/0` (allow all)
5. Connection string format:
   ```
   mongodb+srv://username:password@cluster0-xxxxx.mongodb.net/todoapp
   ```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tasks won't save | Check backend URL in `REACT_APP_API_URL` |
| CORS errors | Check `FRONTEND_URL` in backend matches your frontend domain |
| "Cannot reach API" | Verify backend is deployed and environment variables are set |
| Works locally, fails on Vercel | Check environment variables are configured in Vercel |
| Blank page on frontend | Check React build was successful in Vercel logs |

---

## Files To Know

```
frontend/
├── .env.local          (local development)
├── .env.production     (production - for Vercel)
├── src/
│   └── config/
│       └── apiConfig.js (centralized API URL)

backend/
├── .env                (local development)
├── vercel.json         (Vercel serverless config)
└── server.js           (CORS configured)
```

---

Need help? Check:
- `VERCEL_DEPLOYMENT.md` - Full deployment guide
- `VERCEL_FIX_SUMMARY.md` - What was fixed and why
- Vercel dashboard logs - Build and Function logs
- Browser console - Network errors (F12 → Console)
