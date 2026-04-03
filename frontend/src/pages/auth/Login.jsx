import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
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
    <div className="flex flex-col justify-center py-20 sm:px-6 lg:px-8 bg-beige min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <img loading="lazy" src="/logo.png" className="mx-auto h-24 mb-6 object-contain" alt="Melora Logo" />
        <h2 className="text-4xl font-serif text-brand mb-2">Welcome Back</h2>
        <p className="text-sm text-brand/70">Sign in to access your Melora account.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Remember & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-black hover:text-gold transition-colors">
                  Forgot your password?
                </Link>
              </div>
            </div>

            {authError && (
              <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
                {authError}
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 border border-transparent text-sm font-medium text-white bg-[#1a1a2e] hover:bg-gold transition-colors duration-300 uppercase tracking-widest disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-black hover:text-gold transition-colors">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
