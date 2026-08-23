import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, User, Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import type { Role } from '../../types';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

const roleCredentials: Record<'customer' | 'agent' | 'admin', { email: string; pass: string }> = {
  customer: { email: 'customer1@test.com', pass: 'Customer@123' },
  agent: { email: 'agent1@lastmile.com', pass: 'Agent@123' },
  admin: { email: 'admin@lastmile.com', pass: 'Admin@123' },
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'agent' | 'admin'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: roleCredentials.customer.email,
      password: roleCredentials.customer.pass,
    },
  });

  const handleRoleChange = (role: 'customer' | 'agent' | 'admin') => {
    setSelectedRole(role);
    setValue('email', roleCredentials[role].email);
    setValue('password', roleCredentials[role].pass);
    setError('');
  };

  const onSubmit = async (data: FormData) => {
    try {
      setError('');
      await login(data.email, data.password);
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const role: Role = user.role;
        if (role === 'ADMIN') navigate('/admin/dashboard');
        else if (role === 'DELIVERY_AGENT') navigate('/agent/dashboard');
        else navigate('/customer/dashboard');
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr?.response?.data?.message ?? 'Invalid email or password');
    }
  };

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col font-sans">
      {/* TopAppBar */}
      <header className="bg-white border-b border-[#c5c6cd]/50 fixed top-0 w-full z-50 flex justify-between items-center px-8 h-16 max-w-7xl mx-auto left-0 right-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#435c5b] flex items-center justify-center text-white shadow-sm">
            <Truck className="w-5 h-5" />
          </div>
          <h1 className="font-headline text-xl sm:text-2xl font-bold tracking-tight text-[#435c5b]">
            LogisticsPro
          </h1>
        </div>
        <div className="text-xs font-medium text-[#75777d]">
          Last-Mile Delivery Management
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6 mt-16">
        <div className="bg-white border border-[#c5c6cd]/60 rounded-2xl p-8 sm:p-10 w-full max-w-md shadow-[0px_4px_16px_rgba(91,117,115,0.08)]">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#191c1e] mb-1.5">Sign In</h2>
            <p className="text-sm text-[#45474c]">Access your logistics dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#191c1e] tracking-wide block">
                SELECT ROLE
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleRoleChange('customer')}
                  className={`text-center py-2.5 px-3 border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'customer'
                      ? 'bg-[#5b7573] text-[#defbf8] border-[#5b7573] shadow-sm'
                      : 'border-[#c5c6cd]/80 text-[#45474c] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Customer
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('agent')}
                  className={`text-center py-2.5 px-3 border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'agent'
                      ? 'bg-[#5b7573] text-[#defbf8] border-[#5b7573] shadow-sm'
                      : 'border-[#c5c6cd]/80 text-[#45474c] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Agent
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleChange('admin')}
                  className={`text-center py-2.5 px-3 border rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    selectedRole === 'admin'
                      ? 'bg-[#5b7573] text-[#defbf8] border-[#5b7573] shadow-sm'
                      : 'border-[#c5c6cd]/80 text-[#45474c] hover:bg-[#f2f4f6]'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#191c1e] block" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75777d]" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className="w-full bg-white border border-[#c5c6cd] rounded-lg py-2.5 pl-10 pr-3.5 text-sm text-[#191c1e] placeholder-[#75777d]/60 focus:outline-none focus:border-[#435c5b] focus:ring-2 focus:ring-[#435c5b]/20 transition-all"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-[#191c1e] block" htmlFor="password">
                  Password
                </label>
                <a href="#forgot" className="text-xs font-medium text-[#435c5b] hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#75777d]" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#c5c6cd] rounded-lg py-2.5 pl-10 pr-10 text-sm text-[#191c1e] placeholder-[#75777d]/60 focus:outline-none focus:border-[#435c5b] focus:ring-2 focus:ring-[#435c5b]/20 transition-all"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#75777d] hover:text-[#191c1e]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 font-medium mt-1">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 rounded-lg p-3 text-xs text-[#93000a] font-medium">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#435c5b] text-white font-semibold text-sm rounded-lg py-3 hover:bg-[#354a49] transition-colors active:scale-[0.99] disabled:opacity-60 shadow-sm"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In to LogisticsPro'}
            </button>
          </form>

          <p className="text-center text-xs text-[#45474c] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#435c5b] font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
