import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { TrendingUp, Lock, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [validToken, setValidToken] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      await api.get(`/api/auth/verify-reset-token/${token}`);
      setValidToken(true);
    } catch (error) {
      setValidToken(false);
      setToast({
        message: 'Invalid or expired reset link.',
        type: 'error',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (password.length < 6) {
      setToast({ message: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      await api.post('/api/auth/reset-password', { token, password });
      setSuccess(true);
      setToast({ 
        message: 'Password reset successfully!', 
        type: 'success' 
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      setToast({
        message: error.response?.data?.message || 'Failed to reset password. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password.length > 0 ? (
    password.length < 6 ? 'weak' : password.length < 10 ? 'medium' : 'strong'
  ) : null;

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FinanceFlow</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Smart Financial Management</p>
              </div>
            </div>

            {!validToken ? (
              <div>
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="text-red-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Invalid Link
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
              </div>
            ) : success ? (
              <div>
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Password Reset!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Your password has been successfully reset. Redirecting to login...
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Reset Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your new password below
                </p>
              </div>
            )}
          </div>

          {!validToken ? (
            <Link
              to="/forgot-password"
              className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-center transition-colors"
            >
              Request New Link
            </Link>
          ) : !success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordStrength && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                          passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' :
                          'w-full bg-green-500'
                        }`}
                      ></div>
                    </div>
                    <span className={`text-xs font-medium ${
                      passwordStrength === 'weak' ? 'text-red-500' :
                      passwordStrength === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-400"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          ) : (
            <div className="flex justify-center">
              <LoadingSpinner size="md" />
            </div>
          )}

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      {/* Right Side - Feature */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-primary-400/20 rounded-full -top-48 -left-48 blur-3xl"></div>
          <div className="absolute w-96 h-96 bg-primary-500/20 rounded-full -bottom-48 -right-48 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white" size={48} />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Secure & Protected
          </h2>
          <p className="text-primary-100 text-lg leading-relaxed mb-8">
            Your new password will be encrypted using industry-standard security protocols.
          </p>
          
          <div className="space-y-3">
            {[
              'Password must be at least 6 characters',
              'Use a mix of letters, numbers, and symbols',
              'Avoid using common words or phrases'
            ].map((tip, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-primary-50 text-sm text-left">
                ✓ {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;