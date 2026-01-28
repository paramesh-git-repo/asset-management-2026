import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/auth.api';
import { userApi } from '../api/user.api';
import { Avatar } from '../components/ui/Avatar';
import {
  User,
  Mail,
  Shield,
  Eye,
  EyeOff,
  Lock,
  CheckCircle,
  AlertCircle,
  Info,
  Calendar,
  Clock,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { jwtDecode } from 'jwt-decode';
import { getProfileImageUrl } from '../utils/profileImage';

export const Settings: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Profile state
  const [email, setEmail] = useState(user?.email || '');
  const [role, setRole] = useState(user?.role || '');
  const [name, setName] = useState(user?.name || '');
  const [nameError, setNameError] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Update email and role when user changes
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setRole(user.role);
      setNewEmail(user.email);
      setName(user.name || '');
    }
  }, [user]);

  const handleProfileNameSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    if (trimmed.length < 2) {
      setNameError('Name is too short');
      return;
    }
    if (trimmed.length > 60) {
      setNameError('Name is too long');
      return;
    }

    setNameError('');
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await userApi.updateProfile({ name: trimmed });
      updateUser(updatedUser);
      showToast('Profile updated successfully', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setNameError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSelectPhoto = () => {
    fileInputRef.current?.click();
  };

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_SIZE) {
      showToast('Image size exceeds 10MB limit', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      showToast('Only JPEG, PNG, WEBP allowed', 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setIsUploadingImage(true);
    try {
      const updatedUser = await userApi.uploadProfileImage(file);
      updateUser(updatedUser);
      showToast('Profile photo updated', 'success');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to upload profile image';
      showToast(errorMessage, 'error');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    // Validation
    if (!newEmail || !emailPassword) {
      setEmailError('Email and password are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (newEmail.toLowerCase() === user?.email?.toLowerCase()) {
      setEmailError('New email must be different from current email');
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const response = await authApi.updateEmail({
        email: newEmail,
        password: emailPassword,
      });

      // Update tokens in localStorage
      localStorage.setItem('accessToken', response.tokens.accessToken);
      localStorage.setItem('refreshToken', response.tokens.refreshToken);

      // Update user in context
      updateUser(response.user);

      showToast('Email updated successfully', 'success');
      setIsEditingEmail(false);
      setEmailPassword('');
      setNewEmail(response.user.email);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update email';
      setEmailError(errorMessage);
      setEmailPassword('');
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleCancelEmailEdit = () => {
    setIsEditingEmail(false);
    setNewEmail(user?.email || '');
    setEmailPassword('');
    setEmailError('');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setIsChangingPassword(true);

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });

      showToast('Password changed successfully', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to change password';
      setPasswordError(errorMessage);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string } => {
    if (password.length === 0) return { strength: 'weak', color: 'gray' };
    if (password.length < 6) return { strength: 'weak', color: 'red' };
    if (password.length < 10) return { strength: 'medium', color: 'yellow' };
    return { strength: 'strong', color: 'green' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  // Get session info from token
  const getSessionInfo = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const decoded = jwtDecode(token) as { exp: number; iat: number };
      const expiresAt = new Date(decoded.exp * 1000);
      const issuedAt = new Date(decoded.iat * 1000);
      
      return {
        expiresAt,
        issuedAt,
        expiresIn: Math.floor((decoded.exp * 1000 - Date.now()) / 1000 / 60), // minutes
      };
    } catch (error) {
      return null;
    }
  };

  const sessionInfo = getSessionInfo();

    return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 text-lg mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        {/* Profile Settings */}
        <Card title="Profile Settings" className="shadow-md ring-1 ring-gray-200">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar
                  name={user?.name || user?.email || 'User'}
                  src={getProfileImageUrl(user?.profileImage)}
                  size="lg"
                />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSelectPhoto}
                  isLoading={isUploadingImage}
                  disabled={isUploadingImage}
                >
                  Change Photo
                </Button>
              </div>
            </div>
          <p className="text-xs text-gray-500">JPG or PNG • Max size 5 MB</p>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                Full Name
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="Enter your full name"
                  className={cn(nameError && 'border-red-500 focus:ring-red-500')}
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleProfileNameSave}
                  isLoading={isUpdatingProfile}
                  disabled={isUpdatingProfile}
                >
                  Save
                </Button>
              </div>
              {nameError && (
                <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <p>{nameError}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                Email Address
                            </label>
              {!isEditingEmail ? (
                <>
                            <Input
                    value={email}
                                readOnly
                    className="bg-gray-50 cursor-not-allowed"
                                placeholder="Email"
                            />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">Click Edit to change your email address</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingEmail(true)}
                    >
                      Edit
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Input
                    type="email"
                    value={newEmail}
                    onChange={(e) => {
                      setNewEmail(e.target.value);
                      setEmailError('');
                    }}
                    placeholder="Enter new email address"
                    required
                    disabled={isUpdatingEmail}
                    className={cn(emailError && 'border-red-500 focus:ring-red-500')}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-700">Confirm with Password</label>
                    <div className="relative">
                      <Input
                        type={showEmailPassword ? 'text' : 'password'}
                        value={emailPassword}
                        onChange={(e) => {
                          setEmailPassword(e.target.value);
                          setEmailError('');
                        }}
                        placeholder="Enter your password to confirm"
                        required
                        disabled={isUpdatingEmail}
                        className={cn('pr-10', emailError && 'border-red-500 focus:ring-red-500')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEmailPassword(!showEmailPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        tabIndex={-1}
                      >
                        {showEmailPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  {emailError && (
                    <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-2 text-xs text-red-700">
                      <AlertCircle className="h-3 w-3 shrink-0" />
                      <p>{emailError}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEmailEdit}
                      disabled={isUpdatingEmail}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      isLoading={isUpdatingEmail}
                      disabled={isUpdatingEmail}
                    >
                      Update Email
                    </Button>
                        </div>
                </>
              )}
            </form>

                        <div className="space-y-2">
              <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                                Role
                            </label>
                            <Input
                value={role}
                                readOnly
                className="bg-gray-50 cursor-not-allowed"
                                placeholder="Role"
                            />
              <p className="text-xs text-gray-500">Role is assigned by your administrator.</p>
                        </div>

            <div className="pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500">
                Profile changes update instantly across the app.
              </div>
                        </div>
                    </div>
                </Card>

                    </div>

      {/* Security Settings */}
      <Card title="Security Settings" className="shadow-md ring-1 ring-gray-200">
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                                        Current Password
                                    </label>
                <div className="relative">
                                    <Input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordError('');
                    }}
                                        placeholder="Enter current password"
                    required
                    disabled={isChangingPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                                </div>

                                <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-500" />
                                        New Password
                                    </label>
                <div className="relative">
                                    <Input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordError('');
                    }}
                                        placeholder="Enter new password"
                    required
                    disabled={isChangingPassword}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                                </div>
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'h-1.5 flex-1 rounded-full',
                          passwordStrength.strength === 'weak' && 'bg-red-500',
                          passwordStrength.strength === 'medium' && 'bg-yellow-500',
                          passwordStrength.strength === 'strong' && 'bg-green-500'
                        )}
                      />
                      <span className="text-xs text-gray-500 capitalize">{passwordStrength.strength}</span>
                            </div>
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                            </div>
                )}
                        </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-900 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-500" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordError('');
                    }}
                    placeholder="Confirm new password"
                    required
                    disabled={isChangingPassword}
                    className={cn(
                      'pr-10',
                      confirmPassword &&
                        newPassword &&
                        confirmPassword !== newPassword &&
                        'border-red-500 focus:ring-red-500'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {confirmPassword && newPassword && confirmPassword === newPassword && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    <span>Passwords match</span>
                  </div>
                )}
              </div>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{passwordError}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="h-4 w-4" />
                <span>Password must be at least 6 characters long</span>
              </div>
              <Button type="submit" variant="danger" isLoading={isChangingPassword} disabled={isChangingPassword}>
                Change Password
              </Button>
            </div>
          </form>
                        </div>
                    </Card>

      {/* Session Information */}
      {sessionInfo && (
        <Card title="Session Information" className="shadow-md ring-1 ring-gray-200">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-blue-700 font-medium">Session Expires In</p>
                <p className="text-sm font-semibold text-blue-900">
                  {sessionInfo.expiresIn > 0 ? `${sessionInfo.expiresIn} minutes` : 'Expired'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-700 font-medium">Token Expires At</p>
                <p className="text-sm font-semibold text-gray-900">
                  {sessionInfo.expiresAt.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-amber-900">Token Refresh</p>
                <p className="text-xs text-amber-700 mt-1">
                  Your access token will automatically refresh when it expires. No action needed.
                </p>
                </div>
            </div>
          </div>
        </Card>
      )}

      {/* Account Information */}
      <Card title="Account Information" className="shadow-md ring-1 ring-gray-200">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User ID</p>
            <p className="text-sm font-mono text-gray-900 break-all">{user?.id || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Account Type</p>
            <p className="text-sm font-semibold text-gray-900">{user?.role || 'N/A'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</p>
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </span>
            </div>
        </div>
      </Card>
        </div>
    );
};
