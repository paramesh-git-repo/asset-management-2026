# Asset Management System - Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your configuration

4. Make sure MongoDB is running

5. Start the development server:
```bash
npm run dev
```

## API Endpoints

All endpoints are prefixed with `/api/v1`

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

