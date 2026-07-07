// File: src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, LogIn, UserPlus, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Layers className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
              Project <span className="text-indigo-600">Camp</span>
            </span>
          </Link>

          {/* Action Buttons & Auth Navigation */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                
                {/* Dashboard / Workspaces Link */}
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-1.5 text-sm font-semibold text-indigo-700 bg-indigo-50 px-3 py-2 rounded-lg hover:bg-indigo-100 transition border border-indigo-100"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span className="hidden sm:inline">Workspaces</span>
                </Link>
                
                {/* Profile Link */}
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="hidden sm:inline">{user.username}</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition border border-red-100"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <>
                {/* Logged Out State */}
                <Link 
                  to="/login" 
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition"
                >
                  <UserPlus className="h-4 w-4" />
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}