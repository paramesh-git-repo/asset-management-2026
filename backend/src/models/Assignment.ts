import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
  asset: mongoose.Types.ObjectId;
  employee: mongoose.Types.ObjectId;
  assignedDate: Date;
  assignedAt?: Date;
  returnDate?: Date;
  returnedAt?: Date | null;
  dueDate?: Date;
  status: 'Active' | 'Returned';
  assignedBy: mongoose.Types.ObjectId;
  notes?: string;
  condition?: 'GOOD' | 'DAMAGED';
  remarks?: string;
  accessories?: string[];
  accessoriesIssued?: string[];
  issuedAccessories?: string[];
  returnedAccessories?: string[];
}

const AssignmentSchema = new Schema<IAssignment>(
  {
    asset: {
      type: Schema.Types.ObjectId,
      ref: 'Asset',
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    assignedDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    assignedAt: {
      type: Date,
      default: Date.now,
    },
    returnDate: {
      type: Date,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Active', 'Returned'],
      default: 'Active',
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: {
      type: String,
    },
    condition: {
      type: String,
      enum: ['GOOD', 'DAMAGED'],
    },
    remarks: {
      type: String,
    },
    accessories: [
      {
        type: String,
        enum: ['Charger', 'Mouse', 'Headphones', 'Monitor'],
      },
    ],
    accessoriesIssued: [
      {
        type: String,
        enum: ['CHARGER', 'MOUSE', 'HEADPHONES', 'MONITOR'],
      },
    ],
    issuedAccessories: [
      {
        type: String,
        enum: ['Charger', 'Mouse', 'Headphones', 'Monitor'],
      },
    ],
    returnedAccessories: [
      {
        type: String,
        enum: ['Charger', 'Mouse', 'Headphones', 'Monitor'],
        default: [],
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

AssignmentSchema.virtual('isOverdue').get(function (this: IAssignment) {
  if (!this.dueDate) return false;
  if (this.returnedAt || this.returnDate) return false;
  if (this.status === 'Returned') return false;
  return this.dueDate.getTime() < Date.now();
});

AssignmentSchema.index({ asset: 1, status: 1 });
AssignmentSchema.index({ employee: 1 });

export const Assignment = mongoose.model<IAssignment>('Assignment', AssignmentSchema);

