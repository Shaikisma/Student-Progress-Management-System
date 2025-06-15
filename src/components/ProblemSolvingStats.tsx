import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProblemStats } from '../types/Student';
import { ActivityHeatmap } from './ActivityHeatmap';

interface ProblemSolvingStatsProps {
  stats: ProblemStats;
}

export function ProblemSolvingStats({ stats }: ProblemSolvingStatsProps) {
  const [timeFilter, setTimeFilter] = useState<7 | 30 | 90>(30);

  const difficultyData = Object.entries(stats.difficultyDistribution).map(([range, count]) => ({
    range,
    count,
  }));

  const recentActivity = stats.dailyActivity.slice(-timeFilter);
  const totalRecentProblems = recentActivity.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Problem Solving Analytics
        </h3>
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeFilter(days as 7 | 30 | 90)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                timeFilter === days
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Solved</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {stats.totalSolved}
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Rating</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.maxRating}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Rating</div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {stats.averageRating}
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg/Day</div>
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {stats.averagePerDay.toFixed(1)}
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Last {timeFilter} Days Summary
        </h4>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalRecentProblems} problems solved
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Average: {(totalRecentProblems / timeFilter).toFixed(1)} problems per day
        </div>
      </div>

      {/* Difficulty Distribution Chart */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Problems by Difficulty Range
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={difficultyData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="range" 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--tooltip-bg)',
                border: '1px solid var(--tooltip-border)',
                borderRadius: '8px',
                color: 'var(--tooltip-text)',
              }}
              formatter={(value: any) => [`${value} problems`, 'Count']}
            />
            <Bar 
              dataKey="count" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Activity Heatmap */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Daily Activity (Last 365 Days)
        </h4>
        <ActivityHeatmap data={stats.dailyActivity} />
      </div>
    </div>
  );
}