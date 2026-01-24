import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateEmailSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required to change email'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name is required').max(60, 'Name is too long'),
});

// Employee Schemas
export const createEmployeeSchema = z.object({
  employeeId: z
    .string()
    .regex(/^EMP-\d{3,}$/, 'Employee ID must match format EMP-001')
    .optional(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required'),
  department: z.string().min(1, 'Department is required'),
  position: z.string().min(1, 'Position is required'),
  hireDate: z.string().datetime('Invalid date format'),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

// Do not allow updating employeeId via update endpoint
export const updateEmployeeSchema = createEmployeeSchema
  .omit({ employeeId: true })
  .partial();

export const updateEmployeeStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

// Asset Schemas
export const createAssetSchema = z.object({
  assetId: z
    .string()
    .regex(/^AST-\d{3,}$/, 'Asset ID must match format AST-001')
    .optional(),
  name: z.string().min(1, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  serialNumber: z.string().min(1, 'Serial number is required'),
  purchaseDate: z.string().datetime('Invalid date format'),
  warrantyExpiration: z.string().datetime('Invalid date format').optional(),
  department: z.string().optional(),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  status: z.enum(['Available', 'Assigned', 'In Repair', 'Retired']).optional(),
});

// Assignment Schemas
export const createAssignmentSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  assignedDate: z.string().datetime('Invalid date format'),
  dueDate: z.string().datetime('Invalid date format').optional(),
  notes: z.string().optional(),
  accessories: z
    .array(z.enum(['Charger', 'Mouse', 'Headphones', 'Monitor']))
    .optional(),
  accessoriesIssued: z
    .array(z.enum(['CHARGER', 'MOUSE', 'HEADPHONES', 'MONITOR']))
    .optional(),
});

export const returnAssignmentSchema = z.object({
  assignmentId: z.string().min(1, 'Assignment ID is required'),
  returnDate: z.string().datetime('Invalid date format'),
  notes: z.string().optional(),
});

export const returnAssetSchema = z.object({
  condition: z.enum(['GOOD', 'DAMAGED'], {
    errorMap: () => ({ message: 'Condition must be either GOOD or DAMAGED' }),
  }),
  remarks: z.string().optional(),
  returnedAccessories: z
    .array(z.enum(['Charger', 'Mouse', 'Headphones', 'Monitor']))
    .optional(),
});

export const updateAssignmentSchema = z.object({
  dueDate: z.string().datetime('Invalid date format').optional(),
  notes: z.string().optional(),
  accessories: z
    .array(z.enum(['Charger', 'Mouse', 'Headphones', 'Monitor']))
    .optional(),
  accessoriesIssued: z
    .array(z.enum(['CHARGER', 'MOUSE', 'HEADPHONES', 'MONITOR']))
    .optional(),
  condition: z.enum(['GOOD', 'DAMAGED']).optional(),
  returnedAccessories: z
    .array(z.enum(['Charger', 'Mouse', 'Headphones', 'Monitor']))
    .optional(),
});
