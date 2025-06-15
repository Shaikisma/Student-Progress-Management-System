import { codeforcesApi } from './codeforcesApi';
import { Student, Contest, ProblemStats, CodeforcesSubmission } from '../types/Student';
import { differenceInDays, subDays } from 'date-fns';

export class DataSyncService {
  private static instance: DataSyncService;

  static getInstance(): DataSyncService {
    if (!DataSyncService.instance) {
      DataSyncService.instance = new DataSyncService();
    }
    return DataSyncService.instance;
  }

  async syncStudentData(student: Student): Promise<{
    updatedStudent: Student;
    contests: Contest[];
    problemStats: ProblemStats;
  }> {
    try {
      console.log(`Syncing data for ${student.codeforcesHandle}...`);

      // Get user info
      const userInfo = await codeforcesApi.getUserInfo(student.codeforcesHandle);
      
      // Get rating history (contests)
      const contests = await codeforcesApi.getUserRatingHistory(student.codeforcesHandle);
      
      // Get submissions for problem stats
      const submissions = await codeforcesApi.getUserSubmissions(student.codeforcesHandle);
      
      // Calculate problem stats
      const problemStats = this.calculateProblemStats(submissions);
      
      // Calculate total unsolved problems
      const totalUnsolvedProblems = await this.calculateUnsolvedProblems(contests, student.codeforcesHandle);
      
      // Update contest data with problem counts
      const updatedContests = await this.enrichContestData(contests, student.codeforcesHandle);
      
      // Find last submission date
      const lastSubmissionDate = submissions.length > 0 
        ? new Date(Math.max(...submissions.map(s => s.creationTimeSeconds * 1000)))
        : undefined;

      const updatedStudent: Student = {
        ...student,
        currentRating: userInfo.rating || student.currentRating,
        maxRating: userInfo.maxRating || student.maxRating,
        lastUpdated: new Date(),
        lastSubmissionDate,
        totalUnsolvedProblems
      };

      return {
        updatedStudent,
        contests: updatedContests,
        problemStats
      };
    } catch (error) {
      console.error(`Error syncing data for ${student.codeforcesHandle}:`, error);
      throw error;
    }
  }

  private calculateProblemStats(submissions: CodeforcesSubmission[]): ProblemStats {
    // Filter only accepted submissions
    const acceptedSubmissions = submissions.filter(s => s.verdict === 'OK');
    
    // Get unique problems (by contestId + index)
    const uniqueProblems = new Map();
    acceptedSubmissions.forEach(submission => {
      const key = `${submission.problem.contestId}-${submission.problem.index}`;
      if (!uniqueProblems.has(key)) {
        uniqueProblems.set(key, submission);
      }
    });

    const solvedProblems = Array.from(uniqueProblems.values());
    const totalSolved = solvedProblems.length;
    
    // Calculate average rating
    const ratedProblems = solvedProblems.filter(p => p.problem.rating);
    const averageRating = ratedProblems.length > 0 
      ? Math.round(ratedProblems.reduce((sum, p) => sum + (p.problem.rating || 0), 0) / ratedProblems.length)
      : 0;
    
    // Find max rating
    const maxRating = ratedProblems.length > 0 
      ? Math.max(...ratedProblems.map(p => p.problem.rating || 0))
      : 0;

    // Calculate difficulty distribution
    const difficultyDistribution: { [key: string]: number } = {
      '800-1000': 0,
      '1000-1200': 0,
      '1200-1400': 0,
      '1400-1600': 0,
      '1600-1800': 0,
      '1800+': 0,
    };

    ratedProblems.forEach(problem => {
      const rating = problem.problem.rating || 0;
      if (rating >= 800 && rating < 1000) difficultyDistribution['800-1000']++;
      else if (rating >= 1000 && rating < 1200) difficultyDistribution['1000-1200']++;
      else if (rating >= 1200 && rating < 1400) difficultyDistribution['1200-1400']++;
      else if (rating >= 1400 && rating < 1600) difficultyDistribution['1400-1600']++;
      else if (rating >= 1600 && rating < 1800) difficultyDistribution['1600-1800']++;
      else if (rating >= 1800) difficultyDistribution['1800+']++;
    });

    // Calculate daily activity
    const dailyActivity = this.calculateDailyActivity(acceptedSubmissions);
    
    // Calculate average per day (last 30 days)
    const last30Days = dailyActivity.slice(-30);
    const totalLast30Days = last30Days.reduce((sum, day) => sum + day.count, 0);
    const averagePerDay = totalLast30Days / 30;

    return {
      totalSolved,
      averageRating,
      maxRating,
      averagePerDay: Math.round(averagePerDay * 10) / 10,
      difficultyDistribution,
      dailyActivity
    };
  }

  private calculateDailyActivity(submissions: CodeforcesSubmission[]): { date: string; count: number }[] {
    const activity = new Map<string, number>();
    const today = new Date();
    
    // Initialize last 365 days with 0
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activity.set(dateStr, 0);
    }

    // Count submissions per day
    submissions.forEach(submission => {
      const date = new Date(submission.creationTimeSeconds * 1000);
      const dateStr = date.toISOString().split('T')[0];
      if (activity.has(dateStr)) {
        activity.set(dateStr, (activity.get(dateStr) || 0) + 1);
      }
    });

    return Array.from(activity.entries()).map(([date, count]) => ({ date, count }));
  }

  private async calculateUnsolvedProblems(contests: Contest[], handle: string): Promise<number> {
    let totalUnsolved = 0;
    
    for (const contest of contests) {
      try {
        const standings = await codeforcesApi.getContestStandings(contest.contestId, handle);
        totalUnsolved += Math.max(0, standings.totalProblems - standings.problemsSolved);
      } catch (error) {
        console.warn(`Could not calculate unsolved problems for contest ${contest.contestId}`);
      }
    }
    
    return totalUnsolved;
  }

  private async enrichContestData(contests: Contest[], handle: string): Promise<Contest[]> {
    const enrichedContests = [];
    
    for (const contest of contests) {
      try {
        const standings = await codeforcesApi.getContestStandings(contest.contestId, handle);
        enrichedContests.push({
          ...contest,
          rank: standings.rank || contest.rank,
          problemsSolved: standings.problemsSolved,
          totalProblems: standings.totalProblems,
          unsolvedProblems: Math.max(0, standings.totalProblems - standings.problemsSolved)
        });
      } catch (error) {
        // Keep original contest data if we can't fetch standings
        enrichedContests.push({
          ...contest,
          unsolvedProblems: 0
        });
      }
    }
    
    return enrichedContests;
  }

  checkInactiveStudents(students: Student[]): Student[] {
    const sevenDaysAgo = subDays(new Date(), 7);
    
    return students.filter(student => {
      if (!student.reminderEnabled || !student.lastSubmissionDate) {
        return false;
      }
      
      return differenceInDays(new Date(), student.lastSubmissionDate) >= 7;
    });
  }

  async sendReminderEmail(student: Student): Promise<boolean> {
    // Simulate email sending
    console.log(`Sending reminder email to ${student.email} (${student.name})`);
    
    // In a real implementation, you would integrate with an email service like:
    // - SendGrid
    // - AWS SES
    // - Nodemailer with SMTP
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate 95% success rate
      const success = Math.random() > 0.05;
      
      if (success) {
        console.log(`✅ Reminder email sent successfully to ${student.email}`);
        return true;
      } else {
        console.log(`❌ Failed to send reminder email to ${student.email}`);
        return false;
      }
    } catch (error) {
      console.error(`Error sending email to ${student.email}:`, error);
      return false;
    }
  }
}

export const dataSyncService = DataSyncService.getInstance();