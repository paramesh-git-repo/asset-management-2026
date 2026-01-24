# Asset Management System - Startup Guide

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (running locally on port 27017 or MongoDB Atlas connection string)
- **npm** or **yarn**

## Quick Start

### 1. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS (if installed via Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: MongoDB Atlas**
- Use your MongoDB Atlas connection string in the `.env` file

### 2. Backend Setup & Start

```bash
cd backend

# Install dependencies (if not already installed)
npm install

# Create/verify .env file exists with:
# PORT=5001
# MONGODB_URI=mongodb://localhost:27017/asset-management
# JWT_ACCESS_SECRET=supersecretaccesskey
# JWT_REFRESH_SECRET=supersecretrefreshkey
# JWT_ACCESS_EXPIRES_IN=15m
# JWT_REFRESH_EXPIRES_IN=7d
# FRONTEND_URL=http://localhost:5173

# Seed the database with default admin user
npm run seed

# Start the backend server
npm run dev
```

**Expected Backend Output:**
```
📦 Connecting to MongoDB: mongodb://localhost:27017/asset-management...
✅ MongoDB connected successfully
🚀 Server is running on port 5001
📡 API endpoints available at http://localhost:5001/api/v1
💚 Health check: http://localhost:5001/health
🔗 Frontend URL: http://localhost:5173
```

### 3. Frontend Setup & Start

```bash
cd frontend

# Install dependencies (if not already installed)
npm install

# The frontend is already configured to connect to backend on port 5001
# No .env file needed (defaults to http://localhost:5001/api/v1)

# Start the frontend development server
npm run dev
```

**Expected Frontend Output:**
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 4. Verify Connection

1. Open browser: `http://localhost:5173`
2. The application will automatically:
   - Attempt to login with default credentials (admin@example.com / password123)
   - Load dashboard data from backend
   - Display assets, employees, and assignments

3. Check browser console for:
   - ✅ No CORS errors
   - ✅ Successful API calls (200 status)
   - ✅ No authentication errors

## Default Credentials

- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** Admin (full access)

> **Note:** These credentials are created by the seed script. The frontend automatically logs in with these credentials on first load.

## API Endpoints

All endpoints are prefixed with `/api/v1`

### Health Check
- `GET http://localhost:5001/health` - Server status

### Authentication
- `POST /auth/login` - Login (returns user + tokens)
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires auth)

### Assets
- `GET /assets` - Get all assets (with filters: ?status=Available&category=Laptop)
- `GET /assets/:id` - Get asset by ID
- `POST /assets` - Create asset (Admin/Manager only)
- `PUT /assets/:id` - Update asset (Admin/Manager only)
- `DELETE /assets/:id` - Delete asset (Admin only)

### Employees
- `GET /employees` - Get all employees (with filters: ?status=Active&department=IT)
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create employee (Admin/Manager only)
- `PUT /employees/:id` - Update employee (Admin/Manager only)
- `PATCH /employees/:id/deactivate` - Deactivate employee (Admin/Manager only)

### Assignments
- `GET /assignments` - Get all assignments (with filters: ?status=Active&employeeId=xxx)
- `GET /assignments/:id` - Get assignment by ID
- `GET /assignments/history` - Get assignment history (?assetId=xxx&employeeId=xxx)
- `POST /assignments` - Create assignment (Admin/Manager only)
- `PATCH /assignments/return` - Return assignment (Admin/Manager only)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
❌ MongoDB connection error: connect ECONNREFUSED
```
**Solution:** Ensure MongoDB is running:
```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ping')"

# Start MongoDB if not running
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5001
```
**Solution:** Change PORT in `.env` file or kill the process using port 5001

**JWT Secret Error:**
- Ensure `.env` file has JWT secrets configured
- Default values work for development but should be changed in production

### Frontend Issues

**API Connection Refused:**
```
GET http://localhost:5001/api/v1/... net::ERR_CONNECTION_REFUSED
```
**Solution:**
1. Verify backend is running on port 5001
2. Check backend console for startup messages
3. Test health endpoint: `curl http://localhost:5001/health`

**CORS Errors:**
- Verify `FRONTEND_URL=http://localhost:5173` in backend `.env`
- Ensure CORS middleware is configured correctly

**Authentication Errors:**
- Run seed script: `cd backend && npm run seed`
- Verify default credentials exist in database
- Check browser localStorage for tokens

### Database Issues

**Seed Script Fails:**
- Ensure MongoDB is running
- Check MONGODB_URI in `.env` is correct
- Verify database permissions

**No Data Showing:**
- Run seed script to create default admin user
- Create test data via the UI or API
- Check MongoDB collection: `db.users.find()`, `db.assets.find()`, etc.

## Development Workflow

1. **Start MongoDB** (if local)
2. **Start Backend:** `cd backend && npm run dev`
3. **Start Frontend:** `cd frontend && npm run dev`
4. **Open Browser:** `http://localhost:5173`
5. **Make Changes:** Both servers have hot-reload enabled

## Production Build

### Backend
```bash
cd backend
npm run build
npm start  # Runs from dist/app.js
```

### Frontend
```bash
cd frontend
npm run build  # Creates dist/ folder
npm run preview  # Preview production build
```

## Environment Variables

### Backend (.env)
```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/asset-management
JWT_ACCESS_SECRET=your-access-token-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env - Optional)
```env
VITE_API_URL=http://localhost:5001/api/v1
```
(Defaults to `http://localhost:5001/api/v1` if not set)

---

## Verification Checklist

- [ ] MongoDB is running
- [ ] Backend server starts without errors
- [ ] Backend shows "✅ MongoDB connected successfully"
- [ ] Backend shows "🚀 Server is running on port 5001"
- [ ] Frontend server starts without errors
- [ ] Browser opens to `http://localhost:5173`
- [ ] Dashboard loads without errors
- [ ] No CORS errors in browser console
- [ ] API calls return 200 status codes
- [ ] Default admin user exists (from seed script)

---

**Need Help?** Check the console logs for specific error messages.
