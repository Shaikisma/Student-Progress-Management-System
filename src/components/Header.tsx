import React, { useState } from 'react';
import { Code2, Users, Settings, Clock } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { CronSettings } from './CronSettings';

interface HeaderProps {
  currentView: 'dashboard' | 'profile';
  onViewChange: (view: 'dashboard' | 'profile') => void;
  onManualSync: () => void;
}

export function Header({ currentView, onViewChange, onManualSync }: HeaderProps) {
  const [showCronSettings, setShowCronSettings] = useState(false);

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Code2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Student Progress System
                </h1>
              </div>
              
              <nav className="hidden md:flex space-x-1">
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Dashboard
                </button>
              </nav>
            </div>

            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button 
                onClick={() => setShowCronSettings(true)}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
                title="Sync Settings"
              >
                <Clock className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <CronSettings
        isOpen={showCronSettings}
        onClose={() => setShowCronSettings(false)}
        onManualSync={onManualSync}
      />
    </>
  );
}