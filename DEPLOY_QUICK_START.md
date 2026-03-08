# Quick Start: Deploy to Render + Vercel

## TL;DR - 15 Minutes

### 1. **MongoDB Atlas**
- Visit https://mongodb.com/atlas → Free cluster
- Create user & get connection string
- Copy it for Render

### 2. **Render Backend** (5 min)
```
1. https://render.com → New → Web Service
2. Connect GitHub → Select repo
3. Root: backend | Build: npm install | Start: node server.js
4. Add ENV: MONGODB_URI + PORT=5000
5. Deploy → Copy URL
```

### 3. **Vercel Frontend** (5 min)
```
1. https://vercel.com → Import project
2. Root: frontend
3. Add ENV: REACT_APP_API_URL=https://your-api.onrender.com/api/todos
4. Deploy → Done!
```

---

## Verification

```bash
# Test backend
curl https://your-api.onrender.com/api/todos

# Open frontend in browser
https://your-project.vercel.app
```

---

## Key Points

| Part | Service | Cost | URL |
|------|---------|------|-----|
| Database | MongoDB Atlas | FREE (512MB) | Cloud |
| Backend API | Render | FREE ($0.10/month after free tier) | https://your-api.onrender.com |
| Frontend | Vercel | FREE | https://your-app.vercel.app |

---

## Environment Variables

**Backend (Render .env)**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
PORT=5000
```

**Frontend (Vercel .env)**
```
REACT_APP_API_URL=https://your-api.onrender.com/api/todos
```

---

## Your Current Setup ✅

- ✅ Backend using `process.env.MONGODB_URI`
- ✅ Backend start command: `npm start` → `node server.js`
- ✅ Frontend using `process.env.REACT_APP_API_URL`
- ✅ CORS enabled for cross-origin requests
- ✅ Code structure ready for deployment

**Ready to deploy! Start with MongoDB Atlas, then Render, then Vercel.**
