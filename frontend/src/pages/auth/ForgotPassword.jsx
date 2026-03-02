import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      await authService.forgotPassword(data.email);
      setMessage('If an account exists, a reset link has been sent.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center py-20 sm:px-6 lg:px-8 bg-white min-h-[70vh]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-4xl font-serif text-black mb-2">Reset Password</h2>
        <p className="text-sm text-gray-500">Enter your email to receive a password reset link.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-4 shadow-sm border border-gray-100 sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
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

            {message && (
              <div className="bg-green-50 text-green-700 p-3 rounded text-sm text-center">
                {message}
              </div>
            )}
            {errorMsg && (
              <div className="bg-red-50 text-red-500 p-3 rounded text-sm text-center">
                {errorMsg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 border border-transparent text-sm font-medium text-white bg-black hover:bg-gold transition-colors duration-300 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-black hover:text-gold transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
