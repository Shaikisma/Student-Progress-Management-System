import axios from 'axios';
import { CodeforcesUserInfo, CodeforcesSubmission, Contest } from '../types/Student';

const CODEFORCES_API_BASE = 'https://codeforces.com/api';

// Rate limiting to avoid hitting API limits
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CodeforcesAPI {
  private static instance: CodeforcesAPI;
  private requestQueue: Promise<any> = Promise.resolve();

  static getInstance(): CodeforcesAPI {
    if (!CodeforcesAPI.instance) {
      CodeforcesAPI.instance = new CodeforcesAPI();
    }
    return CodeforcesAPI.instance;
  }

  private async makeRequest<T>(url: string): Promise<T> {
    // Queue requests to avoid rate limiting
    this.requestQueue = this.requestQueue.then(async () => {
      await delay(200); // 200ms delay between requests
      try {
        const response = await axios.get(url, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Student-Progress-System/1.0'
          }
        });
        
        if (response.data.status !== 'OK') {
          throw new Error(response.data.comment || 'API request failed');
        }
        
        return response.data.result;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 400) {
            throw new Error('Invalid handle or user not found');
          }
          if (error.response?.status === 503) {
            throw new Error('Codeforces API temporarily unavailable');
          }
        }
        throw error;
      }
    });

    return this.requestQueue;
  }

  async getUserInfo(handle: string): Promise<CodeforcesUserInfo> {
    const url = `${CODEFORCES_API_BASE}/user.info?handles=${handle}`;
    const result = await this.makeRequest<any[]>(url);
    
    if (!result || result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];
    return {
      handle: user.handle,
      rating: user.rating,
      maxRating: user.maxRating,
      rank: user.rank,
      maxRank: user.maxRank
    };
  }

  async getUserSubmissions(handle: string, from: number = 1, count: number = 10000): Promise<CodeforcesSubmission[]> {
    const url = `${CODEFORCES_API_BASE}/user.status?handle=${handle}&from=${from}&count=${count}`;
    return this.makeRequest<CodeforcesSubmission[]>(url);
  }

  async getUserRatingHistory(handle: string): Promise<Contest[]> {
    const url = `${CODEFORCES_API_BASE}/user.rating?handle=${handle}`;
    const result = await this.makeRequest<any[]>(url);
    
    return result.map((contest, index) => ({
      id: `${contest.contestId}-${index}`,
      contestId: contest.contestId,
      contestName: contest.contestName,
      handle,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.newRating - contest.oldRating,
      ratingUpdateTimeSeconds: contest.ratingUpdateTimeSeconds,
      problemsSolved: 0, // Will be calculated from submissions
      totalProblems: 0, // Will be calculated from contest info
      unsolvedProblems: 0 // Will be calculated
    }));
  }

  async getContestStandings(contestId: number, handle: string): Promise<{ rank: number; problemsSolved: number; totalProblems: number }> {
    try {
      const url = `${CODEFORCES_API_BASE}/contest.standings?contestId=${contestId}&handles=${handle}&showUnofficial=true`;
      const result = await this.makeRequest<any>(url);
      
      if (result.rows && result.rows.length > 0) {
        const row = result.rows[0];
        const problemsSolved = row.problemResults.filter((p: any) => p.points > 0).length;
        const totalProblems = result.problems.length;
        
        return {
          rank: row.rank,
          problemsSolved,
          totalProblems
        };
      }
    } catch (error) {
      console.warn(`Could not fetch standings for contest ${contestId}:`, error);
    }
    
    return { rank: 0, problemsSolved: 0, totalProblems: 0 };
  }
}

export const codeforcesApi = CodeforcesAPI.getInstance();