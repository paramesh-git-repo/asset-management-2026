import mongoose from 'mongoose';
import { Assignment, IAssignment } from '../models/Assignment';
import { Asset } from '../models/Asset';
import { Employee } from '../models/Employee';

export const createAssignment = async (
  data: Partial<IAssignment>
): Promise<IAssignment> => {
  // Check if asset exists and is available
  const asset = await Asset.findById(data.asset);
  if (!asset) {
    throw new Error('Asset not found');
  }
  if (asset.status !== 'Available') {
    throw new Error('Asset is not available for assignment');
  }

  // Check if employee exists
  const employee = await Employee.findById(data.employee);
  if (!employee) {
    throw new Error('Employee not found');
  }

  // Check if employee has active assignment for this asset
  const existingAssignment = await Assignment.findOne({
    asset: data.asset,
    status: 'Active',
  });
  if (existingAssignment) {
    throw new Error('Asset is already assigned');
  }

  // Create assignment
  const assignment = new Assignment(data);
  await assignment.save();

  // Update asset status and current holder
  asset.status = 'Assigned';
  asset.currentHolder = data.employee as mongoose.Types.ObjectId;
  await asset.save();

  const populatedAssignment = await Assignment.findById(assignment._id)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy');
  
  if (!populatedAssignment) {
    throw new Error('Failed to create assignment');
  }
  
  return populatedAssignment;
};

export const getAssignments = async (filters?: {
  employeeId?: string;
  assetId?: string;
  status?: string;
}): Promise<IAssignment[]> => {
  const query: any = {};
  
  if (filters?.employeeId) {
    query.employee = filters.employeeId;
  }
  
  if (filters?.assetId) {
    query.asset = filters.assetId;
  }
  
  if (filters?.status) {
    query.status = filters.status;
  }

  return Assignment.find(query)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy')
    .sort({ assignedAt: -1 });
};

export const getAssignmentById = async (id: string): Promise<IAssignment | null> => {
  return Assignment.findById(id)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy');
};

export const returnAssignment = async (
  id: string,
  returnDate: Date,
  notes?: string
): Promise<IAssignment | null> => {
  const assignment = await Assignment.findById(id);
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  if (assignment.status === 'Returned') {
    throw new Error('Assignment is already returned');
  }

  assignment.status = 'Returned';
  assignment.returnDate = returnDate;
  assignment.returnedAt = new Date();
  if (notes) {
    assignment.notes = notes;
  }
  await assignment.save();

  // Update asset status and clear current holder
  const asset = await Asset.findById(assignment.asset);
  if (asset) {
    asset.status = 'Available';
    asset.currentHolder = undefined;
    await asset.save();
  }

  return Assignment.findById(id)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy');
};

export const returnAssetById = async (
  assignmentId: string,
  condition: 'GOOD' | 'DAMAGED',
  remarks?: string,
  returnedAccessories?: string[]
): Promise<IAssignment> => {
  // Validate assignment exists and is active
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  
  if (assignment.status === 'Returned') {
    throw new Error('Assignment is already returned');
  }

  // Update assignment with return details
  const returnedAt = new Date();
  assignment.status = 'Returned';
  assignment.returnDate = returnedAt;
  assignment.returnedAt = returnedAt;
  assignment.condition = condition;
  if (remarks) {
    assignment.remarks = remarks;
  }
  if (returnedAccessories) {
    assignment.returnedAccessories = returnedAccessories;
  }
  await assignment.save();

  // Update asset status based on condition
  const asset = await Asset.findById(assignment.asset);
  if (!asset) {
    throw new Error('Asset not found');
  }

  // Set asset status: GOOD -> Available, DAMAGED -> In Repair
  if (condition === 'GOOD') {
    asset.status = 'Available';
  } else if (condition === 'DAMAGED') {
    asset.status = 'In Repair';
  }
  
  // Clear current holder
  asset.currentHolder = undefined;
  await asset.save();

  // Return populated assignment (maintain full history)
  const populatedAssignment = await Assignment.findById(assignmentId)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy');

  if (!populatedAssignment) {
    throw new Error('Failed to retrieve returned assignment');
  }

  return populatedAssignment;
};

export const updateAssignmentById = async (
  assignmentId: string,
  updates: {
    dueDate?: Date;
    notes?: string;
    accessories?: string[];
    condition?: 'GOOD' | 'DAMAGED';
    returnedAccessories?: string[];
  }
): Promise<IAssignment> => {
  const assignment = await Assignment.findById(assignmentId);
  if (!assignment) {
    throw new Error('Assignment not found');
  }
  
  // Allow returnedAccessories updates for returned assignments
  if (updates.returnedAccessories !== undefined) {
    if (assignment.status !== 'Returned') {
      throw new Error('Can only update returned accessories for returned assignments');
    }
    // Merge with existing returnedAccessories
    const existing = assignment.returnedAccessories || [];
    const newReturned = updates.returnedAccessories;
    // Combine and deduplicate
    assignment.returnedAccessories = Array.from(new Set([...existing, ...newReturned]));
  } else {
    // For other updates, only allow on active assignments
    if (assignment.status !== 'Active') {
      throw new Error('Assignment is not active');
    }
  }

  if (updates.dueDate !== undefined) {
    assignment.dueDate = updates.dueDate;
  }
  if (updates.notes !== undefined) {
    assignment.notes = updates.notes;
  }
  if (updates.accessories !== undefined) {
    assignment.accessories = updates.accessories;
  }
  if (updates.condition !== undefined) {
    assignment.condition = updates.condition;
  }

  await assignment.save();

  const populatedAssignment = await Assignment.findById(assignmentId)
    .populate({
      path: 'asset',
      select: 'name assetId category currentHolder',
      populate: { path: 'currentHolder', select: 'name' },
    })
    .populate('employee')
    .populate('assignedBy');

  if (!populatedAssignment) {
    throw new Error('Failed to retrieve updated assignment');
  }

  return populatedAssignment;
};

export const getAssignmentHistory = async (assetId?: string, employeeId?: string): Promise<IAssignment[]> => {
  const query: any = {};
  
  if (assetId) {
    query.asset = assetId;
  }
  
  if (employeeId) {
    query.employee = employeeId;
  }

  return Assignment.find(query)
    .populate({
      path: 'asset',
      populate: { path: 'currentHolder', select: 'name' }
    })
    .populate('employee')
    .populate('assignedBy')
    .sort({ assignedAt: -1 });
};

