# Quick Start Deployment Checklist

Follow these steps in order to deploy your app to Render + Vercel.

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub repository
- [ ] `.gitignore` file exists and excludes `.env` files
- [ ] `render.yaml` file exists in root directory
- [ ] `vercel.json` file exists in root directory
- [ ] Backend builds successfully (`cd backend && npm run build`)
- [ ] Frontend builds successfully (`cd frontend && npm run build`)

## 🚀 Deployment Steps

### Step 1: GitHub Setup
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Render (Backend)
1. [ ] Sign up at [render.com](https://render.com)
2. [ ] Click "New +" → "Blueprint"
3. [ ] Connect GitHub and select your repository
4. [ ] Click "Apply" to deploy
5. [ ] Wait for database and web service to be created
6. [ ] Go to Web Service → Environment tab
7. [ ] Set `FRONTEND_URL` (will update after Vercel deployment)
8. [ ] Set `OUTBOUND_WEBHOOK` (optional)
9. [ ] Generate `WEBHOOK_SECRET` (use: `openssl rand -hex 32`)
10. [ ] Copy backend URL: `https://your-backend.onrender.com`
11. [ ] Run migrations: Shell → `cd backend && npm run migrate`

### Step 3: Vercel (Frontend)
1. [ ] Sign up at [vercel.com](https://vercel.com)
2. [ ] Click "Add New..." → "Project"
3. [ ] Import GitHub repository
4. [ ] Set Root Directory: `frontend` (if needed)
5. [ ] Add Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com`
6. [ ] Click "Deploy"
7. [ ] Copy frontend URL: `https://your-app.vercel.app`

### Step 4: Connect Services
1. [ ] Go back to Render → Backend → Environment
2. [ ] Update `FRONTEND_URL` with your Vercel URL
3. [ ] Save changes (auto-redeploys)

### Step 5: Verify
- [ ] Backend health check: `https://your-backend.onrender.com/health`
- [ ] Frontend loads: `https://your-app.vercel.app`
- [ ] Create a test job
- [ ] Check browser console for errors

## 🔗 Your URLs

- **Frontend**: `https://________________.vercel.app`
- **Backend**: `https://________________.onrender.com`
- **Database**: Managed by Render

## 📝 Environment Variables Reference

### Render Backend
```
NODE_ENV=production
PORT=5000
DB_HOST=<auto-filled>
DB_PORT=<auto-filled>
DB_NAME=<auto-filled>
DB_USER=<auto-filled>
DB_PASSWORD=<auto-filled>
FRONTEND_URL=https://your-app.vercel.app
OUTBOUND_WEBHOOK=https://webhook.site/xxx
WEBHOOK_SECRET=<generate-random>
```

### Vercel Frontend
```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_SOCKET_URL=https://your-backend.onrender.com
```

## 🆘 Common Issues

**Backend won't start?**
- Check build logs in Render
- Verify database credentials
- Ensure migrations ran successfully

**Frontend can't connect to backend?**
- Verify environment variables in Vercel
- Check CORS configuration
- Ensure backend URL is correct

**Database connection failed?**
- Verify database is running in Render
- Check connection credentials
- Run migrations manually via Shell

---

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

