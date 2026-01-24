import { Assignment, IAssignment } from '../models/Assignment';

export interface PendingAccessoryNotification {
  assignmentId: string;
  asset: {
    _id: string;
    name: string;
    assetId: string;
  };
  employee: {
    _id: string;
    employeeId?: string;
    name: string;
    department: string;
  };
  accessory: string;
  returnedAt: Date;
}

export const getPendingAccessoriesNotifications = async (): Promise<PendingAccessoryNotification[]> => {
  // Get only RETURNED assignments
  const returnedAssignments = await Assignment.find({
    status: 'Returned',
    returnedAt: { $exists: true, $ne: null },
  })
    .populate('asset', 'name assetId')
    .populate('employee', 'employeeId name department')
    .sort({ returnedAt: -1 });

  const notifications: PendingAccessoryNotification[] = [];

  returnedAssignments.forEach((assignment) => {
    const issuedAccessories = assignment.issuedAccessories || assignment.accessories || [];
    const returnedAccessories = assignment.returnedAccessories || [];
    const pendingAccessories = issuedAccessories.filter(
      (item) => !returnedAccessories.includes(item)
    );

    // Create a notification for each pending accessory
    pendingAccessories.forEach((accessory) => {
      notifications.push({
        assignmentId: assignment._id.toString(),
        asset: {
          _id: (assignment.asset as any)._id.toString(),
          name: (assignment.asset as any).name,
          assetId: (assignment.asset as any).assetId,
        },
        employee: {
          _id: (assignment.employee as any)._id.toString(),
          employeeId: (assignment.employee as any).employeeId,
          name: (assignment.employee as any).name,
          department: (assignment.employee as any).department,
        },
        accessory,
        returnedAt: assignment.returnedAt || assignment.returnDate || new Date(),
      });
    });
  });

  return notifications;
};
