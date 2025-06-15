import React, { useState } from 'react';
import { ArrowLeft, Calendar, Trophy, Target, TrendingUp, BarChart3 } from 'lucide-react';
import { Student, Contest, ProblemStats } from '../types/Student';
import { ContestHistory } from './ContestHistory';
import { ProblemSolvingStats } from './ProblemSolvingStats';

interface StudentProfileProps {
  student: Student;
  contests: Contest[];
  problemStats: ProblemStats;
  onBack: () => void;
}

export function StudentProfile({ student, contests, problemStats, onBack }: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState<'contests' | 'problems'>('contests');

  const getRatingColor = (rating: number) => {
    if (rating >= 1900) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1600) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 1400) return 'text-cyan-600 dark:text-cyan-400';
    if (rating >= 1200) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {student.name}
            </h1>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>Email: {student.email}</p>
              <p>Phone: {student.phone}</p>
              <p className="font-mono text-blue-600 dark:text-blue-400">
                Handle: {student.codeforcesHandle}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Current</span>
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(student.currentRating)}`}>
                {student.currentRating}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Max</span>
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(student.maxRating)}`}>
                {student.maxRating}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('contests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'contests'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Contest History
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'problems'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Problem Solving
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'contests' ? (
            <ContestHistory contests={contests} />
          ) : (
            <ProblemSolvingStats stats={problemStats} />
          )}
        </div>
      </div>
    </div>
  );
}