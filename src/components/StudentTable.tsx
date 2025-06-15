import React, { useState } from 'react';
import { Search, Plus, Download, Eye, Edit, Trash2, Mail, MailX, RefreshCw, AlertTriangle } from 'lucide-react';
import { Student } from '../types/Student';
import { formatDistanceToNow } from 'date-fns';

interface StudentTableProps {
  students: Student[];
  onStudentSelect: (student: Student) => void;
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onExportCSV: () => void;
  onSyncStudent: (student: Student) => void;
  onToggleReminder: (studentId: string) => void;
  syncingStudents: Set<string>;
}

export function StudentTable({
  students,
  onStudentSelect,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onExportCSV,
  onSyncStudent,
  onToggleReminder,
  syncingStudents,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Student>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.codeforcesHandle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (column: keyof Student) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 1900) return 'text-purple-600 dark:text-purple-400';
    if (rating >= 1600) return 'text-blue-600 dark:text-blue-400';
    if (rating >= 1400) return 'text-cyan-600 dark:text-cyan-400';
    if (rating >= 1200) return 'text-green-600 dark:text-green-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const isInactive = (student: Student) => {
    if (!student.lastSubmissionDate) return false;
    const daysSinceLastSubmission = Math.floor(
      (new Date().getTime() - student.lastSubmissionDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastSubmission >= 7;
  };

  return (
    <div className="bg-white dark:bg-gray-900 shadow-sm rounded-lg">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Students ({students.length})
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={onExportCSV}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              
              <button
                onClick={onAddStudent}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('name')}
              >
                Name
                {sortBy === 'name' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Codeforces Handle
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('currentRating')}
              >
                Current Rating
                {sortBy === 'currentRating' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => handleSort('maxRating')}
              >
                Max Rating
                {sortBy === 'maxRating' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {student.name}
                    </div>
                    {isInactive(student) && (
                      <AlertTriangle className="w-4 h-4 text-orange-500" title="Inactive for 7+ days" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">{student.email}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{student.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-blue-600 dark:text-blue-400">
                    {student.codeforcesHandle}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${getRatingColor(student.currentRating)}`}>
                    {student.currentRating}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-semibold ${getRatingColor(student.maxRating)}`}>
                    {student.maxRating}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      student.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => onToggleReminder(student.id)}
                      className="transition-colors"
                      title={`${student.reminderEnabled ? 'Disable' : 'Enable'} reminders`}
                    >
                      {student.reminderEnabled ? (
                        <Mail className="w-4 h-4 text-blue-500 hover:text-blue-700" />
                      ) : (
                        <MailX className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    {student.reminderCount > 0 && (
                      <span 
                        className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 text-xs px-1 rounded cursor-help"
                        title={`Reminders sent: ${student.reminderCount}`}
                      >
                        {student.reminderCount}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(student.lastUpdated, { addSuffix: true })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onSyncStudent(student)}
                      disabled={syncingStudents.has(student.id)}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors disabled:opacity-50"
                      title="Sync Codeforces Data"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncingStudents.has(student.id) ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={() => onStudentSelect(student)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditStudent(student)}
                      className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                      title="Edit Student"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteStudent(student.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      title="Delete Student"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {sortedStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No students found matching your search.' : 'No students added yet.'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}