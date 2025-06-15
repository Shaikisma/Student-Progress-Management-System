export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  codeforcesHandle: string;
  currentRating: number;
  maxRating: number;
  lastUpdated: Date;
  isActive: boolean;
  reminderCount: number;
  reminderEnabled: boolean;
  lastSubmissionDate?: Date;
  totalUnsolvedProblems: number;
}

export interface Contest {
  id: string;
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  oldRating: number;
  newRating: number;
  ratingChange: number;
  ratingUpdateTimeSeconds: number;
  problemsSolved: number;
  totalProblems: number;
  unsolvedProblems: number;
}

export interface Problem {
  contestId: number;
  index: string;
  name: string;
  type: string;
  rating?: number;
  tags: string[];
  solvedAt: Date;
}

export interface ProblemStats {
  totalSolved: number;
  averageRating: number;
  maxRating: number;
  averagePerDay: number;
  difficultyDistribution: { [key: string]: number };
  dailyActivity: { date: string; count: number }[];
}

export interface CronSettings {
  enabled: boolean;
  time: string; // HH:MM format
  frequency: 'daily' | 'every2days' | 'weekly';
  lastRun?: Date;
  nextRun?: Date;
}

export interface CodeforcesUserInfo {
  handle: string;
  rating?: number;
  maxRating?: number;
  rank?: string;
  maxRank?: string;
}

export interface CodeforcesSubmission {
  id: number;
  contestId: number;
  creationTimeSeconds: number;
  relativeTimeSeconds: number;
  problem: {
    contestId: number;
    index: string;
    name: string;
    type: string;
    rating?: number;
    tags: string[];
  };
  author: {
    contestId: number;
    members: Array<{ handle: string }>;
    participantType: string;
    ghost: boolean;
    room?: number;
    startTimeSeconds?: number;
  };
  programmingLanguage: string;
  verdict: string;
  testset: string;
  passedTestCount: number;
  timeConsumedMillis: number;
  memoryConsumedBytes: number;
}