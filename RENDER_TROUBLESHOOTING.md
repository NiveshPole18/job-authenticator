# 🔧 Render Deployment Troubleshooting Guide

## Common Errors and Solutions

### ❌ Error: `connect ETIMEDOUT` - Database Connection Timeout

**Symptoms:**
```
✗ Database sync failed: ConnectionError [SequelizeConnectionError]: connect ETIMEDOUT
```

**Causes:**
1. Wrong database credentials
2. Using external database URL instead of internal
3. Database not fully started
4. Network timeout

**Solutions:**

#### Solution 1: Use Internal Database URL (Most Common Fix)

Render provides **two** database URLs:
- **Internal URL**: For services within Render (use this!)
- **External URL**: For local development only

**Steps:**
1. Go to Render Dashboard → Your Database Service
2. Find **"Internal Database URL"** (not External)
3. Copy the full URL (looks like: `mysql://user:password@host:port/database`)
4. Go to your Web Service → Environment
5. Add/Update: `DATABASE_URL` = (paste internal URL)
6. **Remove** individual DB_HOST, DB_PORT, etc. (or keep them as backup)
7. Redeploy

#### Solution 2: Verify Database is Running

1. Go to Render Dashboard → Database Service
2. Check status is **"Available"** (green)
3. If it says "Creating" or "Updating", wait for it to finish
4. Database takes 2-3 minutes to fully start

#### Solution 3: Check Environment Variables

In your Web Service → Environment tab, verify you have:

**Option A: Using DATABASE_URL (Recommended)**
```bash
DATABASE_URL=mysql://user:password@host:port/database
```

**Option B: Using Individual Variables**
```bash
DB_HOST=<internal-host-from-database>
DB_PORT=3306
DB_NAME=jobsdb
DB_USER=<user-from-database>
DB_PASSWORD=<password-from-database>
```

**Important**: 
- Use **Internal Database URL** (not External)
- Internal host looks like: `dpg-xxxxx-a.oregon-postgres.render.com`
- External host looks like: `dpg-xxxxx-a.oregon-postgres.render.com` (same, but use internal)

#### Solution 4: Link Database Automatically

1. Go to Web Service → Environment
2. Scroll down to **"Link to Database"** section
3. Select your database from dropdown
4. Render will auto-fill DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
5. Save and redeploy

#### Solution 5: Wait and Retry

- Database might still be starting (takes 2-3 minutes)
- Wait 5 minutes after creating database
- Check database logs for any errors

---

### ❌ Error: `No open ports detected`

**Symptoms:**
```
==> No open ports detected, continuing to scan...
==> Docs on specifying a port: https://render.com/docs/web-services#port-binding
```

**Causes:**
1. Server not listening on `0.0.0.0`
2. Wrong PORT environment variable
3. Server crashed before binding to port

**Solutions:**

#### Solution 1: Listen on 0.0.0.0

Your server must listen on `0.0.0.0`, not `localhost` or `127.0.0.1`.

**Fixed Code** (already updated):
```typescript
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`✓ Server running on port ${PORT}`)
})
```

#### Solution 2: Verify PORT Environment Variable

1. Render automatically sets `PORT` environment variable
2. Your code should use: `const PORT = process.env.PORT || 5000`
3. Don't hardcode the port

#### Solution 3: Check Build Logs

1. Go to Web Service → Logs
2. Look for: `✓ Server running on port XXXX`
3. If you don't see this, server crashed before binding

---

### ❌ Error: Build Failed

**Symptoms:**
- Build status shows "Failed"
- Red error messages in build logs

**Common Causes:**

#### TypeScript Compilation Errors
```bash
# Check build logs for TS errors
# Fix TypeScript errors locally first:
cd backend
npm run build
```

#### Missing Dependencies
```bash
# Ensure package.json has all dependencies
# Check build command includes npm ci
```

#### Wrong Build Command
**Correct:**
```bash
cd backend && npm ci && npm run build
```

**Wrong:**
```bash
npm install  # Use npm ci instead
npm build    # Should be npm run build
```

---

### ❌ Error: Database Migration Failed

**Symptoms:**
- Database connected but migrations fail
- Tables don't exist

**Solutions:**

#### Run Migrations Manually

1. Go to Web Service → Shell
2. Click "Open Shell"
3. Run:
```bash
cd backend
npm run migrate
```

#### Add Migrations to Build

Update build command:
```bash
cd backend && npm ci && npm run build && npm run migrate
```

**Note**: This runs migrations on every deploy. Better to run manually first time.

---

### ❌ Error: CORS Errors in Frontend

**Symptoms:**
- Frontend can't connect to backend
- Browser console shows CORS errors

**Solutions:**

1. **Set FRONTEND_URL in Render:**
   ```bash
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

2. **Verify CORS Configuration:**
   Backend should have:
   ```typescript
   app.use(cors({
     origin: process.env.FRONTEND_URL || "http://localhost:3000",
     credentials: true
   }))
   ```

3. **Check Socket.IO CORS:**
   ```typescript
   const io = new SocketIOServer(httpServer, {
     cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" }
   })
   ```

---

## 🔍 Debugging Checklist

When deployment fails, check:

- [ ] **Database Status**: Is database "Available" (green)?
- [ ] **Environment Variables**: Are all variables set correctly?
- [ ] **Build Logs**: Any errors during build?
- [ ] **Runtime Logs**: Any errors after deployment?
- [ ] **Port Binding**: Is server listening on `0.0.0.0`?
- [ ] **Database URL**: Using internal URL (not external)?
- [ ] **Health Check**: Does `/health` endpoint work?
- [ ] **Network**: Can service reach database? (Check logs)

---

## 📝 Quick Fix Commands

### Check Database Connection
```bash
# In Render Shell
cd backend
node -e "require('./dist/database/connection').default.authenticate().then(() => console.log('OK')).catch(e => console.error(e))"
```

### Test Server Locally
```bash
# Set environment variables
export DATABASE_URL="your-render-database-url"
export PORT=5000
export NODE_ENV=production

# Build and start
cd backend
npm ci
npm run build
npm start
```

### View Recent Logs
```bash
# In Render Dashboard → Logs
# Filter by: Error, Warning
# Check last 100 lines
```

---

## 🆘 Still Stuck?

1. **Check Render Status Page**: [status.render.com](https://status.render.com)
2. **Render Community**: [community.render.com](https://community.render.com)
3. **Render Docs**: [render.com/docs](https://render.com/docs)

---

## ✅ Success Indicators

Your deployment is successful when you see:

1. ✅ Build: "Build successful"
2. ✅ Health Check: `https://your-backend.onrender.com/health` returns `{"status":"ok"}`
3. ✅ Logs show: `✓ Server running on port XXXX`
4. ✅ Logs show: `✓ Database connection established`
5. ✅ Logs show: `✓ Database synchronized`

---

**Last Updated**: Based on latest Render deployment patterns


