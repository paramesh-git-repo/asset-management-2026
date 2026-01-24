# Asset Management System

A complete full-stack Asset Management System for office asset tracking and management.

## Tech Stack

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication (Access + Refresh Tokens)
- Zod for Validation
- TypeScript

### Frontend
- React + Vite + TypeScript
- Tailwind CSS
- React Query
- Axios
- React Router

## Project Structure

```
.
├── backend/          # Express backend API
├── frontend/         # React frontend application
└── FOLDER_STRUCTURE.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/asset-management
JWT_ACCESS_SECRET=your-access-token-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-token-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

5. Make sure MongoDB is running

6. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults to http://localhost:5000):
```env
VITE_API_URL=http://localhost:5000/api/v1
```

4. Start the development server:
```bash
npm run dev
```

The frontend application will be available at `http://localhost:5173`

## Features

### Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- Role-based access control (Admin, Manager, Employee)
- Protected routes based on user roles

### Employee Management
- Create, read, update, and deactivate employees
- Employee fields: Name, Email, Phone, Department, Position, Status, Hire Date
- Search and filter employees

### Asset Management
- Create, read, update, and delete assets
- Asset fields: Asset ID, Name, Category, Serial Number, Status, Purchase Date
- Search and filter assets

### Asset Assignment
- Assign assets to employees
- Return assigned assets
- View assignment history
- Track assignment status

### Dashboard
- Overview statistics (total assets, assigned vs available, active employees)
- Recent assignments
- Real-time updates

## API Endpoints

All API endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires auth)

### Employees
- `GET /employees` - Get all employees
- `GET /employees/:id` - Get employee by ID
- `POST /employees` - Create employee (Admin/Manager only)
- `PUT /employees/:id` - Update employee (Admin/Manager only)
- `PATCH /employees/:id/deactivate` - Deactivate employee (Admin/Manager only)

### Assets
- `GET /assets` - Get all assets
- `GET /assets/:id` - Get asset by ID
- `POST /assets` - Create asset (Admin/Manager only)
- `PUT /assets/:id` - Update asset (Admin/Manager only)
- `DELETE /assets/:id` - Delete asset (Admin only)

### Assignments
- `GET /assignments` - Get all assignments
- `GET /assignments/:id` - Get assignment by ID
- `GET /assignments/history` - Get assignment history
- `POST /assignments` - Create assignment (Admin/Manager only)
- `PATCH /assignments/return` - Return assignment (Admin/Manager only)

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics

## User Roles

- **Admin**: Full access to all features
- **Manager**: Can manage employees, assets, and assignments (cannot delete assets)
- **Employee**: Read-only access to assets and dashboard

## Development

### Backend
- Development server with hot reload: `npm run dev`
- Build: `npm run build`
- Start production: `npm start`

### Frontend
- Development server: `npm run dev`
- Build: `npm run build`
- Preview production build: `npm run preview`

## Notes

- Make sure to set strong JWT secrets in production
- Update MongoDB connection string for production
- Configure CORS settings for production deployment
- The system requires at least one user to be created manually in the database for initial login

