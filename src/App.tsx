import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Header } from './components/Header';
import { StudentTable } from './components/StudentTable';
import { StudentProfile } from './components/StudentProfile';
import { StudentModal } from './components/StudentModal';
import { Student, Contest, ProblemStats } from './types/Student';
import { mockStudents, mockContests, mockProblemStats } from './data/mockData';
import { dataSyncService } from './services/dataSync';
import { cronService } from './services/cronService';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [syncingStudents, setSyncingStudents] = useState<Set<string>>(new Set());
  
  // Store contest and problem data for each student
  const [studentContests, setStudentContests] = useState<Map<string, Contest[]>>(new Map());
  const [studentProblemStats, setStudentProblemStats] = useState<Map<string, ProblemStats>>(new Map());

  // Load students from localStorage on mount
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      try {
        const parsed = JSON.parse(savedStudents);
        setStudents(parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          lastSubmissionDate: s.lastSubmissionDate ? new Date(s.lastSubmissionDate) : undefined,
        })));
      } catch (error) {
        console.error('Error loading students from localStorage:', error);
      }
    }

    // Load contest and problem data
    const savedContests = localStorage.getItem('studentContests');
    if (savedContests) {
      try {
        const parsed = JSON.parse(savedContests);
        const contestsMap = new Map();
        Object.entries(parsed).forEach(([studentId, contests]) => {
          contestsMap.set(studentId, contests);
        });
        setStudentContests(contestsMap);
      } catch (error) {
        console.error('Error loading contests from localStorage:', error);
      }
    }

    const savedProblemStats = localStorage.getItem('studentProblemStats');
    if (savedProblemStats) {
      try {
        const parsed = JSON.parse(savedProblemStats);
        const statsMap = new Map();
        Object.entries(parsed).forEach(([studentId, stats]) => {
          statsMap.set(studentId, stats);
        });
        setStudentProblemStats(statsMap);
      } catch (error) {
        console.error('Error loading problem stats from localStorage:', error);
      }
    }
  }, []);

  // Save students to localStorage whenever students change
  useEffect(() => {
    localStorage.setItem('students', JSON.stringify(students));
  }, [students]);

  // Save contest and problem data to localStorage
  useEffect(() => {
    const contestsObj = Object.fromEntries(studentContests);
    localStorage.setItem('studentContests', JSON.stringify(contestsObj));
  }, [studentContests]);

  useEffect(() => {
    const statsObj = Object.fromEntries(studentProblemStats);
    localStorage.setItem('studentProblemStats', JSON.stringify(statsObj));
  }, [studentProblemStats]);

  // Listen for cron job events
  useEffect(() => {
    const handleCronJob = async (event: CustomEvent) => {
      toast.success('🔄 Scheduled sync started!');
      await handleBulkSync();
    };

    window.addEventListener('cronJobExecuted', handleCronJob as EventListener);
    return () => window.removeEventListener('cronJobExecuted', handleCronJob as EventListener);
  }, [students]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setCurrentView('profile');
  };

  const handleBack = () => {
    setCurrentView('dashboard');
    setSelectedStudent(null);
  };

  const handleAddStudent = () => {
    setEditingStudent(undefined);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
      setStudentContests(prev => {
        const newMap = new Map(prev);
        newMap.delete(studentId);
        return newMap;
      });
      setStudentProblemStats(prev => {
        const newMap = new Map(prev);
        newMap.delete(studentId);
        return newMap;
      });
      
      if (selectedStudent?.id === studentId) {
        handleBack();
      }
      toast.success('Student deleted successfully');
    }
  };

  const handleSaveStudent = async (studentData: Omit<Student, 'id' | 'lastUpdated'>) => {
    if (editingStudent) {
      // Update existing student
      const updatedStudent = { 
        ...studentData, 
        id: editingStudent.id, 
        lastUpdated: new Date() 
      };
      
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id ? updatedStudent : s
      ));

      // If Codeforces handle changed, sync immediately
      if (editingStudent.codeforcesHandle !== studentData.codeforcesHandle) {
        toast.success('Student updated! Syncing Codeforces data...');
        await handleSyncStudent(updatedStudent);
      } else {
        toast.success('Student updated successfully');
      }
    } else {
      // Add new student
      const newStudent: Student = {
        ...studentData,
        id: Date.now().toString(),
        lastUpdated: new Date(),
        totalUnsolvedProblems: 0,
      };
      
      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added! Syncing Codeforces data...');
      await handleSyncStudent(newStudent);
    }
  };

  const handleSyncStudent = async (student: Student) => {
    setSyncingStudents(prev => new Set(prev).add(student.id));
    
    try {
      const { updatedStudent, contests, problemStats } = await dataSyncService.syncStudentData(student);
      
      setStudents(prev => prev.map(s => s.id === student.id ? updatedStudent : s));
      setStudentContests(prev => new Map(prev).set(student.id, contests));
      setStudentProblemStats(prev => new Map(prev).set(student.id, problemStats));
      
      toast.success(`✅ ${student.name}'s data synced successfully!`);
    } catch (error) {
      console.error('Sync error:', error);
      toast.error(`❌ Failed to sync ${student.name}'s data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSyncingStudents(prev => {
        const newSet = new Set(prev);
        newSet.delete(student.id);
        return newSet;
      });
    }
  };

  const handleBulkSync = async () => {
    const activeStudents = students.filter(s => s.isActive);
    
    if (activeStudents.length === 0) {
      toast.error('No active students to sync');
      return;
    }

    toast.loading(`Syncing ${activeStudents.length} students...`, { duration: 2000 });
    
    for (const student of activeStudents) {
      await handleSyncStudent(student);
      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Check for inactive students and send reminders
    const inactiveStudents = dataSyncService.checkInactiveStudents(students);
    
    if (inactiveStudents.length > 0) {
      toast.loading(`Sending reminders to ${inactiveStudents.length} inactive students...`);
      
      for (const student of inactiveStudents) {
        try {
          const success = await dataSyncService.sendReminderEmail(student);
          if (success) {
            setStudents(prev => prev.map(s => 
              s.id === student.id 
                ? { ...s, reminderCount: s.reminderCount + 1 }
                : s
            ));
          }
        } catch (error) {
          console.error(`Failed to send reminder to ${student.email}:`, error);
        }
      }
      
      toast.success(`📧 Reminders sent to ${inactiveStudents.length} inactive students`);
    }
    
    toast.success('🎉 Bulk sync completed!');
  };

  const handleToggleReminder = (studentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, reminderEnabled: !s.reminderEnabled }
        : s
    ));
    
    const student = students.find(s => s.id === studentId);
    if (student) {
      toast.success(`Reminders ${!student.reminderEnabled ? 'enabled' : 'disabled'} for ${student.name}`);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Codeforces Handle',
      'Current Rating',
      'Max Rating',
      'Status',
      'Reminder Enabled',
      'Reminder Count',
      'Total Unsolved Problems',
      'Last Submission Date',
      'Last Updated'
    ];

    const csvData = students.map(student => [
      student.name,
      student.email,
      student.phone,
      student.codeforcesHandle,
      student.currentRating,
      student.maxRating,
      student.isActive ? 'Active' : 'Inactive',
      student.reminderEnabled ? 'Yes' : 'No',
      student.reminderCount,
      student.totalUnsolvedProblems,
      student.lastSubmissionDate?.toISOString() || 'Never',
      student.lastUpdated.toISOString()
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('📊 CSV exported successfully!');
  };

  // Get contest and problem data for selected student
  const selectedStudentContests = selectedStudent 
    ? studentContests.get(selectedStudent.id) || mockContests
    : [];
  
  const selectedStudentProblemStats = selectedStudent
    ? studentProblemStats.get(selectedStudent.id) || mockProblemStats
    : mockProblemStats;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView}
        onManualSync={handleBulkSync}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <StudentTable
            students={students}
            onStudentSelect={handleStudentSelect}
            onAddStudent={handleAddStudent}
            onEditStudent={handleEditStudent}
            onDeleteStudent={handleDeleteStudent}
            onExportCSV={handleExportCSV}
            onSyncStudent={handleSyncStudent}
            onToggleReminder={handleToggleReminder}
            syncingStudents={syncingStudents}
          />
        ) : selectedStudent ? (
          <StudentProfile
            student={selectedStudent}
            contests={selectedStudentContests}
            problemStats={selectedStudentProblemStats}
            onBack={handleBack}
          />
        ) : null}
      </main>

      <StudentModal
        isOpen={isModalOpen}
        student={editingStudent}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
      />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--tooltip-bg)',
            color: 'var(--tooltip-text)',
            border: '1px solid var(--tooltip-border)',
          },
        }}
      />
    </div>
  );
}

export default App;