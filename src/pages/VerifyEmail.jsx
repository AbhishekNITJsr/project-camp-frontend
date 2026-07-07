// File: src/pages/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function VerifyEmail() {
  const { verificationToken } = useParams();
  const [status, setStatus] = useState({ loading: true, success: false, message: '' });

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await axiosInstance.get(`/auth/verify-email/${verificationToken}`);
        setStatus({
          loading: false,
          success: true,
          message: response.data[0]?.message || response.data?.message || 'Email verified successfully!'
        });
      } catch (err) {
        setStatus({
          loading: false,
          success: false,
          message: err.response?.data?.message || 'Invalid or expired verification token.'
        });
      }
    };
    verify();
  }, [verificationToken]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100 text-center">
        {status.loading ? (
          <p className="text-slate-600 animate-pulse font-medium">Verifying your email address...</p>
        ) : status.success ? (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verified!</h2>
            <p className="text-slate-600 mb-6">{status.message}</p>
            <Link to="/login" className="block w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700">
              Go to Login
            </Link>
          </>
        ) : (
          <>
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification Failed</h2>
            <p className="text-slate-600 mb-6">{status.message}</p>
            <Link to="/login" className="block w-full py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200">
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}