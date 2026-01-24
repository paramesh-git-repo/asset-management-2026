import { Asset } from '../models/Asset';
import { Assignment } from '../models/Assignment';
import { Employee } from '../models/Employee';

export const getDashboardStats = async () => {
  const now = new Date();
  const totalAssets = await Asset.countDocuments();
  const availableAssets = await Asset.countDocuments({ status: 'Available' });
  const assignedAssets = await Asset.countDocuments({ status: 'Assigned' });
  const assetsInRepair = await Asset.countDocuments({ status: 'In Repair' });
  const totalEmployees = await Employee.countDocuments({ status: 'Active' });
  const activeAssignments = await Assignment.countDocuments({ status: 'Active' });
  const overdueAssets = await Assignment.countDocuments({
    status: 'Active',
    returnedAt: { $exists: false },
    dueDate: { $lt: now },
  });

  const recentAssignments = await Assignment.find({ status: 'Active' })
    .populate('asset', 'name assetId category')
    .populate('employee', 'employeeId name email department')
    .sort({ assignedDate: -1 })
    .limit(10);

  return {
    totalAssets,
    availableAssets,
    assignedAssets,
    assetsInRepair,
    totalEmployees,
    activeAssignments,
    overdueAssets,
    recentAssignments,
  };
};

