import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const redirectTo = location.state?.from;

  const onSubmit = async (data) => {
    const normalizedData = {
      email: data.email.trim().toLowerCase(),
      password: data.password
    };
    const success = await login(normalizedData);
    if (success) {
      toast.success('Successfully logged in!', { duration: 2500 });
      const loggedInUser = useAuthStore.getState().user;
      navigate(
        redirectTo || (
          loggedInUser?.role === 'admin'
            ? '/admin'
            : loggedInUser?.role === 'cashier'
              ? '/cashier'
              : '/'
        ),
        { replace: true }
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#f8efe4_0%,#f9f3eb_38%,#ffffff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,94,52,0.09),transparent_26%),radial-gradient(circle_at_80%_18%,rgba(217,192,162,0.16),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden rounded-[2rem] border border-[#eadcc8] bg-[linear-gradient(145deg,rgba(255,250,244,0.92),rgba(245,232,218,0.88))] p-10 shadow-[0_24px_70px_rgba(71,45,20,0.10)] lg:block">
          <img loading="lazy" src="/logo.png" className="h-20 object-contain" alt="Melora Logo" />
          <p className="mt-8 text-[11px] uppercase tracking-[0.35em] text-[#9d7848]">Melora Moda</p>
          <h2 className="mt-4 font-serif text-5xl leading-tight text-[#2f2117]">Welcome Back</h2>
          <p className="mt-5 max-w-md text-base leading-8 text-[#7a6653]">
            Sign in to manage your boutique orders, access your dashboard, and continue the Melora experience with ease.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {['Secure access', 'Boutique support', 'Fast account access'].map((item) => (
              <div key={item} className="rounded-full border border-[#e6d7c5] bg-white/85 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7d6040]">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto w-full max-w-md lg:max-w-none">
        <div className="text-center lg:hidden">
          <img loading="lazy" src="/logo.png" className="mx-auto h-20 mb-5 object-contain" alt="Melora Logo" />
          <h2 className="text-4xl font-serif text-[#2f2117] mb-2">Welcome Back</h2>
          <p className="text-sm text-[#7a6653]">Sign in to access your Melora account.</p>
        </div>

        <div className="mt-6 border border-[#eadcc8] bg-white/92 py-10 px-5 shadow-[0_24px_70px_rgba(71,45,20,0.10)] backdrop-blur-sm sm:rounded-[2rem] sm:px-10 lg:mt-0">
          <div className="mb-8 hidden lg:block">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[#9d7848]">Account Access</p>
            <h3 className="mt-3 font-serif text-4xl text-[#2f2117]">Sign In</h3>
            <p className="mt-3 text-sm leading-7 text-[#7a6653]">Use your email and password to continue into the admin, cashier, or customer area.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-[#5d4b3b]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                {...register("email", { 
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
                className={`w-full rounded-2xl border bg-[#fffaf5] p-4 text-sm text-[#2f2117] outline-none transition-colors ${errors.email ? 'border-red-400' : 'border-[#d8c8b5] focus:border-[#8b5e34]'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-[#5d4b3b]">
                Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8b5e34] transition hover:text-[#2f2117]"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register("password", { 
                    required: "Password is required",
                    minLength: { value: 6, message: "Password must be at least 6 characters" }
                  })}
                  className={`w-full rounded-2xl border bg-[#fffaf5] p-4 pr-16 text-sm text-[#2f2117] outline-none transition-colors ${errors.password ? 'border-red-400' : 'border-[#d8c8b5] focus:border-[#8b5e34]'}`}
                />
                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-[#a28769]">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div className="flex items-center justify-end">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-[#2f2117] underline underline-offset-4 transition-colors hover:text-[#8b5e34]">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {authError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-center text-red-600">
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center rounded-full border border-transparent bg-[#2f2117] py-4 text-sm font-medium uppercase tracking-[0.22em] text-white transition-colors duration-300 hover:bg-[#8b5e34] disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-[#7a6653]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#2f2117] hover:text-[#8b5e34] transition-colors">
              Create one now
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
