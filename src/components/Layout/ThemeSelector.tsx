import React from 'react';
import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeSelector: React.FC = () => {
  const { theme, colorScheme, toggleTheme, setColorScheme } = useTheme();

  const colorSchemes = [
    { name: 'blue', color: '#3B82F6', label: 'Bleu' },
    { name: 'green', color: '#10B981', label: 'Vert' },
    { name: 'purple', color: '#8B5CF6', label: 'Violet' },
    { name: 'orange', color: '#F59E0B', label: 'Orange' },
  ];

  return (
    <div className="space-y-4">
      {/* Theme Toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Thème
        </span>
        <button
          onClick={toggleTheme}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <motion.span
            animate={{ x: theme === 'dark' ? 20 : 2 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          />
          <Sun className="absolute left-1 h-3 w-3 text-yellow-500" />
          <Moon className="absolute right-1 h-3 w-3 text-blue-500" />
        </button>
      </div>

      {/* Color Scheme Selector */}
      <div>
        <div className="flex items-center space-x-2 mb-3">
          <Palette className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Couleur principale
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {colorSchemes.map((scheme) => (
            <button
              key={scheme.name}
              onClick={() => setColorScheme(scheme.name as any)}
              className={`relative w-8 h-8 rounded-full transition-all ${
                colorScheme === scheme.name
                  ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-gray-300 ring-offset-white dark:ring-offset-gray-800'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: scheme.color }}
              title={scheme.label}
            >
              {colorScheme === scheme.name && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};