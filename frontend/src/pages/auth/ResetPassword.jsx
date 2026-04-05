import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { authService } from '../../services/authService';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const passwordValue = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    try {
      await authService.resetPassword(token, data.password);
      setMessage('Password updated successfully. You can now sign in.');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] flex-col justify-center bg-white py-20 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mb-2 text-4xl font-serif text-black">Create New Password</h2>
        <p className="text-sm text-gray-500">Enter your new password below.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="border border-gray-100 bg-white px-4 py-10 shadow-sm sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                New password
              </label>
              <input
                id="password"
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (value) => value === passwordValue || 'Passwords do not match'
                })}
                className={`w-full border p-3 focus:outline-none transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 focus:border-black'}`}
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            {message && <div className="rounded bg-green-50 p-3 text-center text-sm text-green-700">{message}</div>}
            {errorMsg && <div className="rounded bg-red-50 p-3 text-center text-sm text-red-500">{errorMsg}</div>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center border border-transparent bg-black py-4 text-sm font-medium uppercase tracking-widest text-white transition-colors duration-300 hover:bg-gold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save New Password'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-black transition-colors hover:text-gold">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
