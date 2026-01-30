export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Active':
    case 'ACTIVE':
    case 'Available':
      return 'bg-green-100 text-green-800';
    case 'Inactive':
    case 'INACTIVE':
    case 'Relieved':
    case 'Retired':
      return 'bg-gray-100 text-gray-800';
    case 'Assigned':
      return 'bg-blue-100 text-blue-800';
    case 'In Repair':
    case 'Maintenance':
      return 'bg-yellow-100 text-yellow-800';
    case 'Returned':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

