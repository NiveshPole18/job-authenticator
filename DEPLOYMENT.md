# Deployment Guide: Render + Vercel

This guide will walk you through deploying your Job Scheduler application to **Render** (backend) and **Vercel** (frontend) from GitHub.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be pushed to a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
4. **Git installed** - For pushing code to GitHub

---

## 🚀 Step 1: Prepare Your GitHub Repository

### 1.1 Initialize Git (if not already done)

```bash
# Navigate to your project root
cd "C:\Users\asus\OneDrive\Desktop\New folder"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Job Scheduler app"

# Add your GitHub repository as remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 1.2 Verify Files Are Committed

Make sure these files are in your repository:
- ✅ `render.yaml` (for Render deployment)
- ✅ `vercel.json` (for Vercel deployment)
- ✅ `.gitignore` (to exclude sensitive files)
- ✅ `backend/` directory with all source files
- ✅ `frontend/` directory with all source files
- ✅ `package.json` files in both backend and frontend

---

## 🗄️ Step 2: Deploy Backend to Render

### 2.1 Create Render Account & Connect GitHub

1. Go to [render.com](https://render.com) and sign up/login
2. Click **"New +"** → **"Blueprint"** (or **"Web Service"**)
3. Connect your GitHub account if prompted
4. Select your repository

### 2.2 Deploy Using Blueprint (Recommended)

1. Render will detect `render.yaml` automatically
2. Click **"Apply"** to create services
3. Render will create:
   - **Web Service** (Backend API)
   - **MySQL Database**

### 2.3 Manual Setup (Alternative)

If Blueprint doesn't work, create services manually:

#### Create Database:
1. Click **"New +"** → **"PostgreSQL"** (or **"MySQL"**)
2. Name: `job-scheduler-db`
3. Database: `jobsdb`
4. User: `jobsuser`
5. Plan: **Free** (or Starter for production)
6. Click **"Create Database"**
7. **Save the connection details** shown

#### Create Web Service:
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `job-scheduler-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `backend` if needed)
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: **Free** (or Starter for production)

### 2.4 Configure Environment Variables

In your Render Web Service dashboard, go to **"Environment"** tab and add:

```bash
NODE_ENV=production
PORT=5000

# Database (Auto-filled if using Blueprint, otherwise use your DB connection details)
DB_HOST=<from-database>
DB_PORT=<from-database>
DB_NAME=<from-database>
DB_USER=<from-database>
DB_PASSWORD=<from-database>

# Frontend URL (will be set after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Webhook Configuration
OUTBOUND_WEBHOOK=https://webhook.site/your-unique-id
WEBHOOK_SECRET=<generate-a-random-secret>

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_MAX_REQUESTS=30
```

**Important**: 
- `FRONTEND_URL` will be updated after Vercel deployment
- Generate a secure `WEBHOOK_SECRET` (you can use: `openssl rand -hex 32`)

### 2.5 Run Database Migrations

After the backend is deployed:

1. Go to your Web Service → **"Shell"** tab
2. Run:
```bash
cd backend
npm run migrate
npm run seed  # Optional: seed sample data
```

Or use Render's **"Manual Deploy"** → **"Run Command"**:
```bash
cd backend && npm run migrate && npm run seed
```

### 2.6 Get Your Backend URL

After deployment, Render will provide a URL like:
```
https://job-scheduler-backend.onrender.com
```

**Save this URL** - you'll need it for Vercel configuration.

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account & Connect GitHub

1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your repository

### 3.2 Configure Project Settings

Vercel will auto-detect Next.js. Configure:

- **Framework Preset**: Next.js
- **Root Directory**: `frontend` (or leave empty if frontend is root)
- **Build Command**: `cd frontend && npm run build` (if root directory is set to `frontend`)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `cd frontend && npm ci` (if root directory is set to `frontend`)

**OR** if your repo root is the frontend:
- **Root Directory**: Leave empty
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3.3 Configure Environment Variables

In Vercel project settings → **"Environment Variables"**, add:

```bash
NEXT_PUBLIC_API_URL=https://job-scheduler-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://job-scheduler-backend.onrender.com
```

**Important**: Replace with your actual Render backend URL from Step 2.6

### 3.4 Deploy

Click **"Deploy"** and wait for the build to complete.

### 3.5 Get Your Frontend URL

After deployment, Vercel will provide a URL like:
```
https://your-app.vercel.app
```

**Save this URL** - you'll need to update Render's `FRONTEND_URL`.

---

## 🔄 Step 4: Connect Frontend and Backend

### 4.1 Update Render Environment Variables

1. Go back to Render → Your Backend Service → **"Environment"**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Click **"Save Changes"**
4. Render will automatically redeploy

### 4.2 Verify CORS Configuration

Your backend should already have CORS enabled. Verify in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000"
}))
```

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend

1. Visit: `https://your-backend.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`

### 5.2 Test Frontend

1. Visit: `https://your-app.vercel.app`
2. Should see the Job Scheduler Dashboard
3. Try creating a job to test the connection

### 5.3 Test API Connection

Open browser console on your frontend and check:
- No CORS errors
- API calls are successful
- Socket.IO connection is established

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Database connection failed
- **Solution**: Verify database credentials in Render environment variables
- Check database is running in Render dashboard

**Problem**: Build fails
- **Solution**: Check build logs in Render
- Ensure `package.json` has correct build script: `"build": "tsc"`

**Problem**: Port binding error
- **Solution**: Render sets `PORT` automatically, ensure your code uses `process.env.PORT`

### Frontend Issues

**Problem**: API calls fail
- **Solution**: 
  - Verify `NEXT_PUBLIC_API_URL` in Vercel environment variables
  - Check backend URL is correct and accessible
  - Verify CORS is configured correctly

**Problem**: Socket.IO not connecting
- **Solution**:
  - Verify `NEXT_PUBLIC_SOCKET_URL` in Vercel
  - Check backend Socket.IO CORS configuration
  - Ensure backend is using HTTPS (Render provides this)

**Problem**: Build fails
- **Solution**: 
  - Check Vercel build logs
  - Ensure all dependencies are in `package.json`
  - Verify TypeScript compilation errors

### Database Migration Issues

**Problem**: Migrations fail
- **Solution**: 
  - Run migrations manually via Render Shell
  - Check database connection string
  - Verify Sequelize configuration

---

## 📝 Environment Variables Reference

### Render (Backend)

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` (auto-set by Render) |
| `DB_HOST` | Database host | Auto-filled from database |
| `DB_PORT` | Database port | `3306` or `5432` |
| `DB_NAME` | Database name | `jobsdb` |
| `DB_USER` | Database user | Auto-filled |
| `DB_PASSWORD` | Database password | Auto-filled |
| `FRONTEND_URL` | Frontend URL | `https://your-app.vercel.app` |
| `OUTBOUND_WEBHOOK` | Webhook URL | `https://webhook.site/xxx` |
| `WEBHOOK_SECRET` | Webhook secret | Random string |

### Vercel (Frontend)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://backend.onrender.com/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO URL | `https://backend.onrender.com` |

---

## 🔄 Updating Your Deployment

### Automatic Deployments

Both Render and Vercel automatically deploy when you push to your GitHub repository:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main
```

### Manual Deployments

- **Render**: Dashboard → Service → **"Manual Deploy"**
- **Vercel**: Dashboard → Project → **"Redeploy"**

---

## 💰 Cost Considerations

### Free Tier Limits

**Render Free Tier**:
- ✅ 750 hours/month (enough for 1 service 24/7)
- ✅ MySQL/PostgreSQL database included
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds

**Vercel Free Tier**:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN

### Upgrading

For production, consider:
- **Render Starter Plan** ($7/month): No spin-down, better performance
- **Vercel Pro Plan** ($20/month): More bandwidth, team features

---

## 🔐 Security Best Practices

1. ✅ Never commit `.env` files (already in `.gitignore`)
2. ✅ Use strong `WEBHOOK_SECRET` (generate with `openssl rand -hex 32`)
3. ✅ Enable HTTPS (automatic on both platforms)
4. ✅ Keep dependencies updated
5. ✅ Use environment variables for all secrets
6. ✅ Enable rate limiting (already configured)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🎉 Success!

Your Job Scheduler application should now be live on:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.onrender.com`
- **Database**: Managed by Render

Happy deploying! 🚀

