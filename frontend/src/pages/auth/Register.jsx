import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error: authError } = useAuthStore();
  
  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch("password", "");

  const onSubmit = async (data) => {
    const success = await registerUser({ name: data.name, email: data.email, password: data.password });
    if (success) {
      toast.success('Account created successfully!', { duration: 3000 });
      navigate('/');
    }
  };

  return (
    <div className="flex flex-col justify-center py-16 sm:px-6 lg:px-8 bg-white min-h-[70vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-4xl font-serif text-black mb-2">Create Account</h2>
        <p className="text-sm text-gray-500">Join Melora to manage your orders and waitlist.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            {/* Full Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                {...register("name", { required: "Name is required" })}
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
            </div>

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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", { 
                  validate: value => value === password || "Passwords do not match"
                })}
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
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
                {isLoading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-black hover:text-gold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
