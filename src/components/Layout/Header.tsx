import React from 'react';
import { Menu, Bell, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import { ThemeSelector } from './ThemeSelector';
import { motion, AnimatePresence } from 'framer-motion';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Bonjour, {user?.employee.name?.split(' ')[0]} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowNotifications(true)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
          
          <div className="hidden md:flex items-center space-x-3">
            <img
              src={user?.employee.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.employee.name || '')}&background=3b82f6&color=ffffff`}
              alt={user?.employee.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.employee.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.employee.role === 'manager' ? 'Manager' : 'Employé'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 w-64 z-30"
          >
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Paramètres d'affichage</h4>
            <ThemeSelector />
          </motion.div>
        )}
      </AnimatePresence>
      </header>
      {/* Notification Panel */}
      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Click outside to close settings */}
      {showSettings && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowSettings(false)}
        />
      )}
    </>
  );
};