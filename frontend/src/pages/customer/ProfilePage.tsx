import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Phone, Save, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import { useToast } from '../../hooks/useToast';
import ToastContainer from '../../components/ui/Toast';
import { formatRole } from '../../utils/formatters';

const profileSchema = z.object({
  name: z.string().min(2, 'Name too short'),
  phone: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Required'),
    newPassword: z
      .string()
      .min(8, 'Min 8 chars')
      .regex(/[A-Z]/, 'Must include uppercase')
      .regex(/[0-9]/, 'Must include number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { toasts, removeToast, toast } = useToast();

  const {
    register: regProfile,
    handleSubmit: submitProfile,
    formState: { errors: profileErrors, isSubmitting: savingProfile },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name, phone: user?.phone },
  });

  const {
    register: regPassword,
    handleSubmit: submitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: savingPassword },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: ProfileForm) => {
    try {
      const updated = await authService.updateProfile(data);
      updateUser(updated);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onChangePassword = async (data: PasswordForm) => {
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      resetPassword();
      toast.success('Password changed successfully');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e?.response?.data?.message ?? 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your account information
        </p>
      </div>

      {/* Avatar Section */}
      <Card>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-600">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">{user?.name}</h2>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 text-xs font-medium">
              {formatRole(user?.role ?? '')}
            </span>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader title="Personal Information" />
        <form onSubmit={submitProfile(onSaveProfile)} className="space-y-4">
          <Input
            label="Full Name"
            leftAddon={<User className="w-4 h-4" />}
            error={profileErrors.name?.message}
            {...regProfile('name')}
          />
          <Input
            label="Email"
            type="email"
            value={user?.email}
            disabled
            leftAddon={<Mail className="w-4 h-4" />}
          />
          <Input
            label="Phone Number"
            type="tel"
            leftAddon={<Phone className="w-4 h-4" />}
            {...regProfile('phone')}
          />
          <Button
            type="submit"
            isLoading={savingProfile}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </form>
      </Card>

      {/* Password Form */}
      <Card>
        <CardHeader title="Change Password" />
        <form onSubmit={submitPassword(onChangePassword)} className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            leftAddon={<Lock className="w-4 h-4" />}
            error={passwordErrors.currentPassword?.message}
            {...regPassword('currentPassword')}
          />
          <Input
            label="New Password"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...regPassword('newPassword')}
          />
          <Input
            label="Confirm New Password"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...regPassword('confirmPassword')}
          />
          <Button
            type="submit"
            variant="secondary"
            isLoading={savingPassword}
          >
            Change Password
          </Button>
        </form>
      </Card>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default ProfilePage;
