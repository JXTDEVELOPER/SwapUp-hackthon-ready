import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../App';
import { getNotifications, markNotificationsAsRead } from '../services/api';
import { Notification } from '../types';
import { SwapIcon, LogoutIcon, LoginIcon, SunIcon, MoonIcon, BellIcon, ChatBubbleLeftRightIcon } from './icons';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    if (user) {
      getNotifications(user.id).then(setNotifications);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const handleNotifClick = () => {
      setIsNotifOpen(!isNotifOpen);
      if(!isNotifOpen && user && notifications.length > 0) {
          markNotificationsAsRead(user.id).then(() => {
              // Set a timeout to remove them visually after the dropdown is seen
              setTimeout(() => setNotifications([]), 2000);
          });
      }
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm dark:shadow-md backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-indigo-600">
          <SwapIcon className="h-8 w-8" />
          <span>SwapUp</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-slate-600 dark:text-slate-300 font-medium">
          <Link to="/browse" className="hover:text-indigo-500 transition-colors">Browse Skills</Link>
          {user && <Link to="/dashboard" className="hover:text-indigo-500 transition-colors">Dashboard</Link>}
          <Link to="/ngo-directory" className="hover:text-indigo-500 transition-colors">NGO Directory</Link>
        </div>
        <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Toggle Theme">
              {theme === 'light' ? <MoonIcon className="h-6 w-6 text-slate-600" /> : <SunIcon className="h-6 w-6 text-yellow-400" />}
            </button>
          {user ? (
            <>
              <div className="relative">
                <button onClick={handleNotifClick} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Notifications">
                    <BellIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                    {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                </button>
                {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 animate-fade-in text-sm">
                       <div className="p-3 font-bold border-b dark:border-slate-700">Notifications</div>
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <Link key={n.id} to={n.link} onClick={() => setIsNotifOpen(false)} className="block px-4 py-3 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    {n.message}
                                </Link>
                            ))
                        ) : <div className="p-4 text-slate-500">No new notifications.</div>}
                    </div>
                )}
              </div>
               <Link to="/chats" className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Chats">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
               </Link>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
              <Link to="/account/settings" className="flex items-center gap-2" title="Settings">
                <img src={user.avatarUrl} alt={user.fullName} className="h-10 w-10 rounded-full object-cover border-2 border-transparent hover:border-indigo-400 transition-colors" />
              </Link>
              <button onClick={handleLogout} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800" title="Logout">
                <LogoutIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary flex items-center gap-2">
              <LoginIcon className="h-5 w-5"/>
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;