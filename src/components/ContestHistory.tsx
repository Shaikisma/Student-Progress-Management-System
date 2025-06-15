import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Contest } from '../types/Student';
import { format } from 'date-fns';
import { Trophy, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface ContestHistoryProps {
  contests: Contest[];
}

export function ContestHistory({ contests }: ContestHistoryProps) {
  const [timeFilter, setTimeFilter] = useState<30 | 90 | 365>(90);

  const filteredContests = contests.filter(contest => {
    const contestDate = new Date(contest.ratingUpdateTimeSeconds * 1000);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeFilter);
    return contestDate >= cutoffDate;
  }).sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds);

  const chartData = filteredContests.map(contest => ({
    date: format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd'),
    rating: contest.newRating,
    contest: contest.contestName,
    change: contest.ratingChange,
  }));

  const getRatingColor = (rating: number) => {
    if (rating >= 1900) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1600) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 1400) return 'text-cyan-600 dark:text-cyan-400';
    if (rating >= 1200) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const totalUnsolvedProblems = filteredContests.reduce((sum, contest) => sum + contest.unsolvedProblems, 0);

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Contest Performance
        </h3>
        <div className="flex gap-2">
          {[30, 90, 365].map((days) => (
            <button
              key={days}
              onClick={() => setTimeFilter(days as 30 | 90 | 365)}
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

      {/* Summary Stats */}
      {filteredContests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contests</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredContests.length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Change</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {filteredContests.length > 0 
                ? Math.round(filteredContests.reduce((sum, c) => sum + c.ratingChange, 0) / filteredContests.length)
                : 0}
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Unsolved</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {totalUnsolvedProblems}
            </div>
          </div>
        </div>
      )}

      {/* Rating Chart */}
      {chartData.length > 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Rating Progress
          </h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
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
                formatter={(value: any, name: string) => [
                  name === 'rating' ? `Rating: ${value}` : value,
                  ''
                ]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
          <p className="text-gray-500 dark:text-gray-400">
            No contest data available for the selected time period.
          </p>
        </div>
      )}

      {/* Contest List */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Recent Contests ({filteredContests.length})
        </h4>
        <div className="space-y-3">
          {filteredContests.reverse().map((contest) => (
            <div
              key={contest.id}
              className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 dark:text-white">
                    {contest.contestName}
                  </h5>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {format(new Date(contest.ratingUpdateTimeSeconds * 1000), 'MMM dd, yyyy')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-semibold ${getRatingColor(contest.newRating)}`}>
                    {contest.newRating}
                  </div>
                  <div className={`text-sm font-medium flex items-center gap-1 ${getChangeColor(contest.ratingChange)}`}>
                    {contest.ratingChange > 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : contest.ratingChange < 0 ? (
                      <TrendingDown className="w-3 h-3" />
                    ) : null}
                    {contest.ratingChange > 0 ? '+' : ''}{contest.ratingChange}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Rank: #{contest.rank}
                </span>
                <span className="text-sm text-green-600 dark:text-green-400">
                  Solved: {contest.problemsSolved}/{contest.totalProblems}
                </span>
                <span className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unsolved: {contest.unsolvedProblems}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}