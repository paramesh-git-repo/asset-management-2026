import mongoose, { Document, Schema } from 'mongoose';

export interface IAsset extends Document {
  assetId: string;
  name: string;
  category: string;
  serialNumber: string;
  status: 'Available' | 'Assigned' | 'In Repair' | 'Retired';
  purchaseDate: Date;
  warrantyExpiration?: Date;
  department?: string;
  currentHolder?: mongoose.Types.ObjectId;
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    cost: number;
    performedBy: string;
  }>;
}

const AssetSchema = new Schema<IAsset>(
  {
    assetId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Assigned', 'In Repair', 'Retired'],
      default: 'Available',
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    warrantyExpiration: {
      type: Date,
    },
    department: {
      type: String,
    },
    currentHolder: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
    },
    maintenanceHistory: {
      type: [
        {
          date: {
            type: Date,
            required: true,
          },
          type: {
            type: String,
            required: true,
          },
          description: {
            type: String,
            required: true,
          },
          cost: {
            type: Number,
            default: 0,
          },
          performedBy: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);

