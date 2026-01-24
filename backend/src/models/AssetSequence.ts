import mongoose, { Document, Schema } from 'mongoose';

export interface IAssetSequence extends Document {
  name: string;
  seq: number;
}

const AssetSequenceSchema = new Schema<IAssetSequence>(
  {
    name: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const AssetSequence = mongoose.model<IAssetSequence>('AssetSequence', AssetSequenceSchema);
