import mongoose, { Document, Schema } from 'mongoose';

export const EMPLOYEE_COMPANIES = ['V-Accel', 'Axess Technology'] as const;
export type EmployeeCompany = (typeof EMPLOYEE_COMPANIES)[number];

export interface IEmployee extends Document {
  employeeId: string;
  company?: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: 'ACTIVE' | 'INACTIVE' | 'Relieved';
  hireDate: Date;
  exitDate?: Date | null;
  user?: mongoose.Types.ObjectId;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    company: {
      type: String,
      enum: ['V-Accel', 'Axess Technology'],
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'Relieved'],
      default: 'ACTIVE',
    },
    hireDate: {
      type: Date,
      required: true,
    },
    exitDate: {
      type: Date,
      default: null,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

EmployeeSchema.index({ employeeId: 1 }, { unique: true });

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);

