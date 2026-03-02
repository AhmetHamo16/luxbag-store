import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { login, isLoading, error: authError } = useAuthStore();

  const onSubmit = async (data) => {
    const success = await login(data);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col justify-center py-20 sm:px-6 lg:px-8 bg-white min-h-[70vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-4xl font-serif text-black mb-2">Welcome Back</h2>
        <p className="text-sm text-gray-500">Sign in to access your Melora account.</p>
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
                <Link to="#" className="font-medium text-black hover:text-gold transition-colors">
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
                className="w-full flex justify-center py-4 border border-transparent text-sm font-medium text-white bg-black hover:bg-gold transition-colors duration-300 uppercase tracking-widest disabled:opacity-50"
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

export default Login;
