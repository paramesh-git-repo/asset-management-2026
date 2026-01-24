# Quick Start Guide - Fix Dashboard Connection Error

## The Problem
The dashboard shows "Backend API Not Available" because:
1. MongoDB is not running
2. Backend server is not running

## Solution (3 Simple Steps)

### Step 1: Start MongoDB

**Option A: If MongoDB is installed locally**
```bash
# Start MongoDB (keep this terminal open)
mongod
```

**Option B: If MongoDB is not installed or you want to use MongoDB Atlas**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string
4. Update `backend/.env`:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string
   ```

**Verify MongoDB is running:**
```bash
mongosh --eval "db.adminCommand('ping')"
```
Expected output: `{ ok: 1 }`

---

### Step 2: Seed the Database (First Time Only)

Open a **new terminal** and run:
```bash
cd "/Users/apple/Documents/Asset Management 2026/backend"
npm run seed
```

Expected output:
```
MongoDB connected successfully
Admin user created successfully
Email: admin@example.com
Password: password123
```

---

### Step 3: Start the Backend Server

In the same terminal (or a new one):
```bash
cd "/Users/apple/Documents/Asset Management 2026/backend"
npm run dev
```

**Expected output:**
```
📦 Connecting to MongoDB: mongodb://localhost:27017/asset-management...
✅ MongoDB connected successfully
🚀 Server is running on port 5001
📡 API endpoints available at http://localhost:5001/api/v1
💚 Health check: http://localhost:5001/health
🔗 Frontend URL: http://localhost:5173
```

**Important:** Keep this terminal open! The server must keep running.

---

### Step 4: Verify Frontend (Already Running)

Your frontend should already be running on `http://localhost:5173`. If not, start it:
```bash
cd "/Users/apple/Documents/Asset Management 2026/frontend"
npm run dev
```

---

## Verify Everything Works

1. **Check Backend Health:**
   ```bash
   curl http://localhost:5001/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Check Browser:**
   - Open `http://localhost:5173`
   - Dashboard should now load (no error message)
   - You should see KPI cards and data

3. **Check Browser Console:**
   - Open DevTools (F12 or Cmd+Option+I)
   - Console should show successful API calls (no red errors)
   - Network tab should show 200 status codes

---

## Common Issues

### "MongoDB connection error"
- **Solution:** Make sure MongoDB is running (Step 1)
- Check: `mongosh --eval "db.adminCommand('ping')"`

### "Port 5001 already in use"
- **Solution:** Kill the process using port 5001:
  ```bash
  lsof -ti:5001 | xargs kill -9
  ```
  Then restart the backend

### "Cannot find module" errors
- **Solution:** Install dependencies:
  ```bash
  cd backend && npm install
  ```

### "Admin user already exists" (during seed)
- **Solution:** This is fine! Your admin user is already created. You can skip the seed step.

---

## What Should Be Running

You need **3 things** running simultaneously:

1. ✅ **MongoDB** - Database server (port 27017)
2. ✅ **Backend** - API server (port 5001) 
3. ✅ **Frontend** - React app (port 5173)

Keep **3 terminal windows** open:
- Terminal 1: `mongod` (MongoDB)
- Terminal 2: `npm run dev` (Backend)
- Terminal 3: `npm run dev` (Frontend)

---

## Default Login Credentials

- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** Admin

The frontend will auto-login with these credentials if the backend is running.

---

## Still Having Issues?

1. Check all 3 services are running (MongoDB, Backend, Frontend)
2. Verify port 5001 is accessible: `curl http://localhost:5001/health`
3. Check backend terminal for error messages
4. Check browser console (F12) for specific error messages
5. Verify `.env` file exists in `backend/` folder

---

**Quick Test:** If you see "✅ MongoDB connected successfully" and "🚀 Server is running on port 5001" in the backend terminal, everything should work!
