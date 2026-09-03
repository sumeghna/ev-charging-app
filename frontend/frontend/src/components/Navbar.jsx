import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white';
  const textColor = isDark ? 'text-gray-100' : 'text-gray-800';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  const hoverColor = isDark ? 'hover:text-blue-400' : 'hover:text-blue-600';

  return (
    <nav className={`${bgColor} border-b ${borderColor} sticky top-0 z-50 transition-colors duration-300`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center text-white text-lg font-bold shadow-lg group-hover:shadow-xl transition-all duration-300">
              ⚡
            </div>
            <div>
              <span className={`text-xl font-bold ${textColor} tracking-tight`}>EV India</span>
              <span className="hidden sm:inline text-xs text-blue-500 ml-1 font-medium">● Live</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/stations" className={`${textColor} ${hoverColor} transition-colors duration-200 text-sm font-medium`}>
              Find Stations
            </Link>
            
            {user && (
              <Link to="/my-bookings" className={`${textColor} ${hoverColor} transition-colors duration-200 text-sm font-medium`}>
                My Bookings
              </Link>
            )}

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${
                isDark ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            {user ? (
              <div className="flex items-center gap-3 ml-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <span className="text-sm">👤</span>
                  <span className={`text-sm font-medium ${textColor}`}>{user.name}</span>
                  <span className={`text-xs ${textMuted} px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700`}>
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login" className={`px-4 py-2 ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} ${textColor} rounded-xl transition-all duration-300 text-sm font-medium`}>
                  Login
                </Link>
                <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg">
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${borderColor} space-y-3`}>
            <Link to="/stations" className={`block ${textColor} ${hoverColor} transition-colors duration-200 text-sm font-medium py-1`} onClick={() => setIsMobileMenuOpen(false)}>
              Find Stations
            </Link>
            {user && (
              <Link to="/my-bookings" className={`block ${textColor} ${hoverColor} transition-colors duration-200 text-sm font-medium py-1`} onClick={() => setIsMobileMenuOpen(false)}>
                My Bookings
              </Link>
            )}
            <div className="flex items-center gap-3 pt-2 border-t ${borderColor}">
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all duration-300 ${
                  isDark ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              {user ? (
                <>
                  <span className={`text-sm ${textColor} font-medium`}>{user.name}</span>
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors duration-300 text-sm font-medium"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className={`px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-100'} ${textColor} rounded-xl text-sm font-medium`} onClick={() => setIsMobileMenuOpen(false)}>
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium shadow-md" onClick={() => setIsMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;