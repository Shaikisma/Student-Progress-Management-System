import { Student, Contest, Problem, ProblemStats } from '../types/Student';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    phone: '+1-555-0123',
    codeforcesHandle: 'alice_codes',
    currentRating: 1542,
    maxRating: 1687,
    lastUpdated: new Date('2024-01-15T08:30:00Z'),
    isActive: true,
    reminderCount: 0,
    reminderEnabled: true,
    lastSubmissionDate: new Date('2024-01-14T16:30:00Z'),
    totalUnsolvedProblems: 12,
  },
  {
    id: '2',
    name: 'Bob Smith',
    email: 'bob.smith@university.edu',
    phone: '+1-555-0124',
    codeforcesHandle: 'bobsmith99',
    currentRating: 1234,
    maxRating: 1456,
    lastUpdated: new Date('2024-01-14T10:15:00Z'),
    isActive: false,
    reminderCount: 2,
    reminderEnabled: true,
    lastSubmissionDate: new Date('2024-01-05T12:00:00Z'), // 10 days ago - inactive
    totalUnsolvedProblems: 8,
  },
  {
    id: '3',
    name: 'Carol Davis',
    email: 'carol.davis@university.edu',
    phone: '+1-555-0125',
    codeforcesHandle: 'carol_dev',
    currentRating: 1789,
    maxRating: 1856,
    lastUpdated: new Date('2024-01-15T09:45:00Z'),
    isActive: true,
    reminderCount: 0,
    reminderEnabled: false,
    lastSubmissionDate: new Date('2024-01-15T09:45:00Z'),
    totalUnsolvedProblems: 15,
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@university.edu',
    phone: '+1-555-0126',
    codeforcesHandle: 'david_w',
    currentRating: 987,
    maxRating: 1123,
    lastUpdated: new Date('2024-01-13T14:20:00Z'),
    isActive: false,
    reminderCount: 1,
    reminderEnabled: true,
    lastSubmissionDate: new Date('2024-01-06T18:30:00Z'), // 9 days ago - inactive
    totalUnsolvedProblems: 5,
  },
  {
    id: '5',
    name: 'Emma Brown',
    email: 'emma.brown@university.edu',
    phone: '+1-555-0127',
    codeforcesHandle: 'emma_b',
    currentRating: 1678,
    maxRating: 1734,
    lastUpdated: new Date('2024-01-15T11:30:00Z'),
    isActive: true,
    reminderCount: 0,
    reminderEnabled: true,
    lastSubmissionDate: new Date('2024-01-15T11:30:00Z'),
    totalUnsolvedProblems: 18,
  },
];

export const mockContests: Contest[] = [
  {
    id: '1',
    contestId: 1912,
    contestName: 'Codeforces Round 912 (Div. 2)',
    handle: 'alice_codes',
    rank: 234,
    oldRating: 1456,
    newRating: 1542,
    ratingChange: 86,
    ratingUpdateTimeSeconds: 1705234800,
    problemsSolved: 3,
    totalProblems: 6,
    unsolvedProblems: 3,
  },
  {
    id: '2',
    contestId: 1911,
    contestName: 'Educational Codeforces Round 162',
    handle: 'alice_codes',
    rank: 445,
    oldRating: 1487,
    newRating: 1456,
    ratingChange: -31,
    ratingUpdateTimeSeconds: 1705148400,
    problemsSolved: 2,
    totalProblems: 7,
    unsolvedProblems: 5,
  },
  {
    id: '3',
    contestId: 1910,
    contestName: 'Codeforces Round 911 (Div. 2)',
    handle: 'alice_codes',
    rank: 156,
    oldRating: 1398,
    newRating: 1487,
    ratingChange: 89,
    ratingUpdateTimeSeconds: 1705062000,
    problemsSolved: 4,
    totalProblems: 6,
    unsolvedProblems: 2,
  },
  {
    id: '4',
    contestId: 1909,
    contestName: 'Codeforces Round 910 (Div. 2)',
    handle: 'alice_codes',
    rank: 678,
    oldRating: 1423,
    newRating: 1398,
    ratingChange: -25,
    ratingUpdateTimeSeconds: 1704975600,
    problemsSolved: 1,
    totalProblems: 5,
    unsolvedProblems: 4,
  },
  {
    id: '5',
    contestId: 1908,
    contestName: 'Educational Codeforces Round 161',
    handle: 'alice_codes',
    rank: 289,
    oldRating: 1356,
    newRating: 1423,
    ratingChange: 67,
    ratingUpdateTimeSeconds: 1704889200,
    problemsSolved: 3,
    totalProblems: 7,
    unsolvedProblems: 4,
  },
];

export const mockProblems: Problem[] = [
  {
    contestId: 1912,
    index: 'A',
    name: 'Accumulator',
    type: 'PROGRAMMING',
    rating: 800,
    tags: ['implementation', 'math'],
    solvedAt: new Date('2024-01-14T16:30:00Z'),
  },
  {
    contestId: 1912,
    index: 'B',
    name: 'Boats',
    type: 'PROGRAMMING',
    rating: 1100,
    tags: ['greedy', 'sortings'],
    solvedAt: new Date('2024-01-14T17:15:00Z'),
  },
  {
    contestId: 1911,
    index: 'A',
    name: 'Array Coloring',
    type: 'PROGRAMMING',
    rating: 900,
    tags: ['constructive algorithms', 'math'],
    solvedAt: new Date('2024-01-13T14:20:00Z'),
  },
  {
    contestId: 1910,
    index: 'C',
    name: 'Colorful Stamp',
    type: 'PROGRAMMING',
    rating: 1400,
    tags: ['implementation', 'strings'],
    solvedAt: new Date('2024-01-12T19:45:00Z'),
  },
];

export const mockProblemStats: ProblemStats = {
  totalSolved: 145,
  averageRating: 1156,
  maxRating: 1800,
  averagePerDay: 2.3,
  difficultyDistribution: {
    '800-1000': 45,
    '1000-1200': 38,
    '1200-1400': 32,
    '1400-1600': 20,
    '1600-1800': 8,
    '1800+': 2,
  },
  dailyActivity: generateDailyActivity(),
};

function generateDailyActivity() {
  const activity = [];
  const today = new Date();
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const count = Math.floor(Math.random() * 8); // 0-7 problems per day
    activity.push({
      date: date.toISOString().split('T')[0],
      count,
    });
  }
  
  return activity;
}