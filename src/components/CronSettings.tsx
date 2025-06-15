import React, { useState, useEffect } from 'react';
import { Clock, Settings, Play, Pause, RefreshCw } from 'lucide-react';
import { CronSettings as CronSettingsType } from '../types/Student';
import { cronService } from '../services/cronService';

interface CronSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onManualSync: () => void;
}

export function CronSettings({ isOpen, onClose, onManualSync }: CronSettingsProps) {
  const [settings, setSettings] = useState<CronSettingsType>(cronService.getSettings());
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSettings(cronService.getSettings());
      
      // Update countdown every minute
      const interval = setInterval(() => {
        setTimeUntilNext(cronService.getTimeUntilNextRun());
      }, 60000);
      
      // Initial update
      setTimeUntilNext(cronService.getTimeUntilNextRun());
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const handleSave = () => {
    cronService.updateSettings(settings);
    onClose();
  };

  const handleManualSync = () => {
    onManualSync();
    cronService.triggerManualSync();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sync Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Auto Sync Status
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                settings.enabled 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
              }`}>
                {settings.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            {settings.enabled && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Next run: {timeUntilNext}
              </div>
            )}
            
            {settings.lastRun && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Last run: {new Date(settings.lastRun).toLocaleString()}
              </div>
            )}
          </div>

          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Automatic Sync
            </label>
            <button
              onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Time Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Sync Time
            </label>
            <input
              type="time"
              value={settings.time}
              onChange={(e) => setSettings(prev => ({ ...prev, time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={!settings.enabled}
            />
          </div>

          {/* Frequency Setting */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Frequency
            </label>
            <select
              value={settings.frequency}
              onChange={(e) => setSettings(prev => ({ ...prev, frequency: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={!settings.enabled}
            >
              <option value="daily">Daily</option>
              <option value="every2days">Every 2 Days</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {/* Manual Sync */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button
              onClick={handleManualSync}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Run Manual Sync Now
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              This will sync all students' data immediately
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}