// File: src/pages/Profile.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, User, ShieldAlert, CheckCircle2, Send } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

export default function Profile() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setResending(true);
    setMessage('');
    try {
      const response = await axiosInstance.post('/auth/resend-email-verification');
      setMessage(response.data[0]?.message || response.data?.message || 'Verification mail sent!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Account Profile</h1>

      {!user.isEmailVerified && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-amber-600 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-amber-900">Email Verification Required</h4>
              <p className="text-sm text-amber-700">Please verify your email address to access full project management capabilities.</p>
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={resending}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-xl hover:bg-amber-700 transition flex-shrink-0 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {resending ? 'Sending...' : 'Resend Email'}
          </button>
        </div>
      )}

      {message && <div className="mb-6 p-4 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium">{message}</div>}

      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <img
          src={user.avatar?.url || "http://placehold.co/200x200"}
          alt="Avatar"
          className="w-28 h-28 rounded-full border-4 border-indigo-50 shadow-sm object-cover"
        />
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">{user.username}</h2>
            {user.isEmailVerified ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <CheckCircle2 className="h-3.5 w-3.5" /> Verified
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                Unverified
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <User className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium">{user.username}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-xl">
              <Mail className="h-5 w-5 text-slate-400" />
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}