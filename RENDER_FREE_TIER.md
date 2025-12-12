# 🆓 Deploy to Render FREE Tier - Complete Guide

This guide shows you how to deploy your Job Scheduler backend to Render's **FREE tier** (no credit card required).

## 🎯 What You Get FREE on Render

- ✅ **750 hours/month** of compute time (enough for 1 service running 24/7)
- ✅ **Free PostgreSQL or MySQL database**
- ✅ **Free SSL/HTTPS** certificates
- ✅ **Free custom domains**
- ⚠️ **Services spin down after 15 minutes** of inactivity (first request takes ~30 seconds)

---

## 📋 Prerequisites

1. **GitHub Account** (free)
2. **Code pushed to GitHub** (see Step 1)
3. **Render Account** - Sign up at [render.com](https://render.com) (no credit card needed)

---

## 🚀 Step-by-Step: Deploy Backend to Render (FREE)

### Step 1: Push Code to GitHub

If you haven't already:

```bash
# Navigate to your project
cd "C:\Users\asus\OneDrive\Desktop\New folder"

# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render deployment"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Important**: Make sure these files are committed:
- ✅ `backend/` folder with all source code
- ✅ `backend/package.json`
- ✅ `backend/tsconfig.json`
- ✅ `render.yaml` (optional but helpful)

---

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) or email
4. **No credit card required** ✅

---

### Step 3: Create FREE Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"** (or **"MySQL"**)
   
   **Note**: PostgreSQL is recommended (more reliable on free tier)

2. Configure:
   - **Name**: `job-scheduler-db`
   - **Database**: `jobsdb`
   - **User**: `jobsuser` (or leave default)
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **PostgreSQL Version**: Latest (or default)
   - **Plan**: **Free** ✅
   - **Datadog API Key**: Leave empty (optional monitoring)

3. Click **"Create Database"**

4. **Wait 2-3 minutes** for database to be created

5. **Save the connection details** shown:
   - Internal Database URL (for Render services)
   - External Database URL (for local access)
   - Host, Port, Database, User, Password

---

### Step 4: Create FREE Web Service (Backend)

#### Option A: Using Blueprint (Easiest - Recommended)

1. Click **"New +"** → **"Blueprint"**

2. Connect your GitHub account if prompted

3. Select your repository

4. Render will detect `render.yaml` automatically

5. Review the services:
   - **Web Service**: Your backend API
   - **Database**: Already created (or will create)

6. Click **"Apply"**

7. Render will start deploying automatically

#### Option B: Manual Setup (If Blueprint doesn't work)

1. Click **"New +"** → **"Web Service"**

2. Connect GitHub and select your repository

3. Configure the service:

   **Basic Settings:**
   - **Name**: `job-scheduler-backend`
   - **Region**: Same as database (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty (or `backend` if your repo root is different)
   - **Runtime**: `Node`
   - **Build Command**: `cd backend && npm ci && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: **Free** ✅

   **Advanced Settings:**
   - **Auto-Deploy**: `Yes` (deploys on every push)
   - **Health Check Path**: `/health`

4. Click **"Create Web Service"**

---

### Step 5: Configure Environment Variables

After the service is created, go to **"Environment"** tab:

#### Required Variables:

**Option A: Using DATABASE_URL (Recommended - Easiest)**

```bash
# Server
NODE_ENV=production
PORT=5000

# Database - Use Internal Database URL (IMPORTANT!)
DATABASE_URL=mysql://user:password@host:port/database

# Frontend (update after deploying to Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Webhook (optional)
OUTBOUND_WEBHOOK=https://webhook.site/your-unique-id
WEBHOOK_SECRET=<generate-random-secret>

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_MAX_REQUESTS=30
```

**How to get DATABASE_URL:**
1. Go to your **Database** service in Render
2. Find **"Internal Database URL"** (NOT External!)
3. Copy the full URL (looks like: `mysql://user:pass@host:3306/dbname`)
4. Paste it as `DATABASE_URL` in your Web Service environment

**Option B: Using Individual Variables**

```bash
# Server
NODE_ENV=production
PORT=5000

# Database (from your database service)
DB_HOST=<copy internal host from database>
DB_PORT=<copy port from database>
DB_NAME=<copy database name>
DB_USER=<copy user from database>
DB_PASSWORD=<copy password from database>

# Frontend (update after deploying to Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Webhook (optional)
OUTBOUND_WEBHOOK=https://webhook.site/your-unique-id
WEBHOOK_SECRET=<generate-random-secret>

# Rate Limiting
RATE_LIMIT_WINDOW_MINUTES=1
RATE_LIMIT_MAX_REQUESTS=30
```

#### Quick Way to Add Database Variables:

**Method 1: Auto-Link Database (Easiest)**
- In Web Service → Environment tab
- Scroll to **"Link to Database"** section
- Select your database from dropdown
- Render auto-fills all database variables ✅

**Method 2: Manual Copy**
1. Go to your **Database** service
2. Copy the **"Internal Database URL"** (use this, not External!)
3. Go back to **Web Service** → **Environment**
4. Add as `DATABASE_URL` = (paste URL)

**⚠️ IMPORTANT**: Always use **Internal Database URL**, not External!
- Internal URL: For services within Render (what you need)
- External URL: Only for local development

---

### Step 6: Run Database Migrations

After your backend is deployed:

#### Method 1: Using Render Shell (Easiest)

1. Go to your **Web Service** → **"Shell"** tab
2. Click **"Open Shell"**
3. Run:
```bash
cd backend
npm run migrate
npm run seed  # Optional: add sample data
```

#### Method 2: Using Manual Deploy Command

1. Go to your **Web Service** → **"Manual Deploy"** tab
2. Select **"Run Command"**
3. Enter:
```bash
cd backend && npm run migrate && npm run seed
```
4. Click **"Run"**

#### Method 3: Add to Build Command (Permanent)

Update your service settings:
- **Build Command**: `cd backend && npm ci && npm run build && npm run migrate`

---

### Step 7: Get Your Backend URL

1. After deployment completes, Render will show your service URL:
   ```
   https://job-scheduler-backend.onrender.com
   ```

2. **Test it**:
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Save this URL** - you'll need it for Vercel frontend configuration

---

## 🔧 Troubleshooting FREE Tier Issues

### Issue 1: Database Connection Timeout (ETIMEDOUT)

**Symptom**: 
```
✗ Database sync failed: ConnectionError [SequelizeConnectionError]: connect ETIMEDOUT
```

**Why**: Wrong database URL or database not accessible.

**Solutions**:
- ✅ **Use Internal Database URL** (not External!)
  - Go to Database → Copy "Internal Database URL"
  - Set as `DATABASE_URL` in Web Service environment
- ✅ **Link Database Automatically**:
  - Web Service → Environment → "Link to Database"
  - Select your database → Auto-fills variables
- ✅ **Wait for Database**: Database takes 2-3 minutes to fully start
- ✅ **Verify Database Status**: Should be "Available" (green)

**See**: `RENDER_TROUBLESHOOTING.md` for detailed fix.

### Issue 2: No Open Ports Detected

**Symptom**:
```
==> No open ports detected, continuing to scan...
```

**Why**: Server not listening on `0.0.0.0` or crashed before binding.

**Solutions**:
- ✅ **Fixed in code**: Server now listens on `0.0.0.0` automatically
- ✅ **Verify PORT**: Render sets `PORT` automatically, code uses `process.env.PORT`
- ✅ **Check Logs**: Look for "✓ Server running on port XXXX"

### Issue 3: Service Spins Down After 15 Minutes

**Symptom**: First request takes 30+ seconds, then works fine.

**Why**: Free tier services spin down after inactivity to save resources.

**Solutions**:
- ✅ This is normal and expected on free tier
- ✅ Consider upgrading to Starter ($7/month) for no spin-down
- ✅ Use a free uptime monitor (like UptimeRobot) to ping `/health` every 5 minutes

**Setup UptimeRobot** (Free):
1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor → HTTP(s)
3. URL: `https://your-backend.onrender.com/health`
4. Interval: 5 minutes
5. This keeps your service "awake"

### Issue 2: Build Fails

**Check**:
- ✅ Build logs in Render dashboard
- ✅ Ensure `package.json` has `"build": "tsc"` script
- ✅ Ensure `package.json` has `"start": "node dist/index.js"` script
- ✅ Check TypeScript compilation errors

**Common Fixes**:
```bash
# Make sure backend/package.json has:
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### Issue 3: Database Connection Failed

**Check**:
- ✅ Database is running (green status in Render)
- ✅ Environment variables are set correctly
- ✅ Using **Internal Database URL** (not external) for Render services
- ✅ Database credentials match

**Fix**:
- Re-link database in Web Service → Environment → "Link to Database"

### Issue 4: Port Binding Error

**Check**: Your code uses `process.env.PORT`

**Verify** in `backend/src/index.ts`:
```typescript
const PORT = process.env.PORT || 5000
```

Render sets `PORT` automatically - your code should use it.

### Issue 5: Out of Free Hours

**Symptom**: Service stops working mid-month

**Why**: Free tier = 750 hours/month (enough for 1 service 24/7)

**Solutions**:
- ✅ Check usage in Render dashboard
- ✅ Delete unused services
- ✅ Upgrade to Starter plan ($7/month) for unlimited hours

---

## 💡 FREE Tier Optimization Tips

### 1. Use PostgreSQL Instead of MySQL
- More reliable on free tier
- Better performance
- Easier to manage

### 2. Minimize Service Count
- Free tier = 750 hours total
- 1 service 24/7 = ~750 hours/month
- Multiple services = hours split between them

### 3. Use UptimeRobot to Prevent Spin-Down
- Free uptime monitoring
- Pings your service every 5 minutes
- Keeps service "awake"

### 4. Monitor Your Usage
- Render Dashboard → Usage
- Track hours used
- Plan accordingly

### 5. Optimize Build Times
- Use `.dockerignore` to exclude unnecessary files
- Minimize dependencies
- Use `npm ci` instead of `npm install` (faster, more reliable)

---

## 📊 FREE Tier Limits Summary

| Resource | Free Tier Limit |
|----------|----------------|
| **Compute Hours** | 750 hours/month |
| **Services** | Unlimited (but hours shared) |
| **Databases** | 1 free PostgreSQL or MySQL |
| **Bandwidth** | 100 GB/month |
| **SSL** | ✅ Free |
| **Custom Domains** | ✅ Free |
| **Auto-Deploy** | ✅ Free |
| **Spin-Down** | ⚠️ After 15 min inactivity |

---

## 🎯 Next Steps After Render Deployment

1. ✅ **Deploy Frontend to Vercel** (also free)
   - See `DEPLOYMENT.md` for Vercel guide

2. ✅ **Update Environment Variables**:
   - Add `FRONTEND_URL` in Render (after Vercel deployment)
   - Add `NEXT_PUBLIC_API_URL` in Vercel (your Render backend URL)

3. ✅ **Test Everything**:
   - Backend health: `https://your-backend.onrender.com/health`
   - Frontend: `https://your-app.vercel.app`
   - Create a test job
   - Check browser console for errors

---

## 🆘 Still Having Issues?

### Check Render Logs:
1. Go to your service → **"Logs"** tab
2. Look for errors (red text)
3. Common issues:
   - Database connection errors
   - Build failures
   - Port binding errors

### Render Support:
- **Free tier**: Community support via [Render Community](https://community.render.com)
- **Paid tier**: Email support

### Common Commands to Test Locally:

```bash
# Test backend build
cd backend
npm ci
npm run build
npm start

# Test database connection
# Use connection string from Render database dashboard
```

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Database created (FREE tier)
- [ ] Web service created (FREE tier)
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Backend URL working (`/health` endpoint)
- [ ] Frontend deployed to Vercel
- [ ] Frontend connected to backend
- [ ] Test job created successfully

---

## 🎉 You're Done!

Your backend is now live on Render FREE tier:
- **URL**: `https://your-backend.onrender.com`
- **Cost**: $0/month ✅
- **Database**: Included FREE ✅

**Remember**: 
- Service may spin down after 15 min (first request slow)
- Use UptimeRobot to keep it awake (free)
- Monitor usage to stay within 750 hours/month

Happy deploying! 🚀

