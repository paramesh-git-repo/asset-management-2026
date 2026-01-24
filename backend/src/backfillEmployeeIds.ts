import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Employee } from './models/Employee';
import { AssetSequence } from './models/AssetSequence';

dotenv.config();

const EMPLOYEE_SEQUENCE_NAME = 'employee';
const formatEmployeeId = (seq: number) => `EMP-${String(seq).padStart(3, '0')}`;

async function getNextEmployeeId(): Promise<string> {
  const counter = await AssetSequence.findOneAndUpdate(
    { name: EMPLOYEE_SEQUENCE_NAME },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return formatEmployeeId(counter.seq);
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/asset-management';
  await mongoose.connect(mongoUri);
  console.log('✅ MongoDB connected');

  // Ensure the counter starts at max existing EMP-### (if any)
  const existingWithId = await Employee.find({ employeeId: { $exists: true, $ne: '' } })
    .select('employeeId')
    .lean();
  const maxSeq = existingWithId.reduce((max, e) => {
    const m = typeof e.employeeId === 'string' ? e.employeeId.match(/^EMP-(\d+)$/i) : null;
    const n = m ? Number(m[1]) : NaN;
    return Number.isFinite(n) ? Math.max(max, n) : max;
  }, 0);
  if (maxSeq > 0) {
    await AssetSequence.findOneAndUpdate(
      { name: EMPLOYEE_SEQUENCE_NAME },
      { $max: { seq: maxSeq } },
      { upsert: true }
    );
    console.log(`🔢 Employee sequence set to at least ${maxSeq}`);
  }

  const toBackfill = await Employee.find({
    $or: [{ employeeId: { $exists: false } }, { employeeId: null }, { employeeId: '' }],
  }).sort({ createdAt: 1 });

  console.log(`👥 Employees missing employeeId: ${toBackfill.length}`);

  let updated = 0;
  for (const emp of toBackfill) {
    emp.employeeId = await getNextEmployeeId();
    await emp.save();
    updated += 1;
    if (updated % 25 === 0) console.log(`… backfilled ${updated}/${toBackfill.length}`);
  }

  console.log(`✅ Backfill complete. Updated ${updated} employees.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('❌ Backfill failed:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

