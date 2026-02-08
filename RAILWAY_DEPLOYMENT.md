# Backend Deployment Guide (Railway)

## Quick Start

1. **Create a Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Backend**
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   railway up
   ```

3. **Set Environment Variables on Railway**
   - Go to your Railway project dashboard
   - Click on the service
   - Go to "Variables" tab
   - Add:
     - `MONGODB_URI`: Your MongoDB connection string (get from MongoDB Atlas)
     - `NODE_ENV`: `production`
     - `PORT`: `5000` (Railway auto-assigns, but leave as fallback)

4. **Get Your Backend URL**
   - Your app will be deployed at: `https://<project-name>.up.railway.app`
   - Copy this URL

## MongoDB Setup (Atlas - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/todoapp?retryWrites=true&w=majority`
5. Use this as `MONGODB_URI` in Railway

## Update Frontend API URL

After deploying backend, update your frontend:

1. Replace all `http://localhost:5000` with your Railway backend URL
2. Or set `REACT_APP_API_URL` environment variable on Vercel
3. Rebuild and redeploy frontend

## Troubleshooting

- **Build fails**: Make sure `package.json` has `"start"` script
- **App crashes**: Check logs in Railway dashboard → Logs tab
- **Database connection fails**: Verify `MONGODB_URI` is correct and IP whitelist includes Railway's IPs (use 0.0.0.0/0 for testing)
