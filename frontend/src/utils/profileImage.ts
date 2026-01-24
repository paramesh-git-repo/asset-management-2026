const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const getApiOrigin = () => {
  if (API_BASE_URL.includes('/api/')) {
    return API_BASE_URL.replace(/\/api\/v1$/, '');
  }
  return API_BASE_URL;
};

export const getProfileImageUrl = (filename?: string | null) => {
  if (!filename) return '';
  if (filename.startsWith('http') || filename.startsWith('/uploads/')) {
    return filename;
  }
  return `${getApiOrigin()}/uploads/profile-images/${filename}`;
};
