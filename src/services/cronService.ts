import { CronSettings } from '../types/Student';

export class CronService {
  private static instance: CronService;
  private cronJob: NodeJS.Timeout | null = null;
  private settings: CronSettings;

  static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  constructor() {
    // Load settings from localStorage or use defaults
    const savedSettings = localStorage.getItem('cronSettings');
    this.settings = savedSettings ? JSON.parse(savedSettings) : {
      enabled: true,
      time: '02:00',
      frequency: 'daily' as const,
      lastRun: undefined,
      nextRun: undefined
    };
    
    this.calculateNextRun();
    this.startCronJob();
  }

  getSettings(): CronSettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<CronSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.calculateNextRun();
    localStorage.setItem('cronSettings', JSON.stringify(this.settings));
    
    // Restart cron job with new settings
    this.stopCronJob();
    if (this.settings.enabled) {
      this.startCronJob();
    }
  }

  private calculateNextRun(): void {
    if (!this.settings.enabled) {
      this.settings.nextRun = undefined;
      return;
    }

    const now = new Date();
    const [hours, minutes] = this.settings.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    // If the time has already passed today, schedule for tomorrow or based on frequency
    if (nextRun <= now) {
      switch (this.settings.frequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'every2days':
          nextRun.setDate(nextRun.getDate() + 2);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
      }
    }
    
    this.settings.nextRun = nextRun;
  }

  private startCronJob(): void {
    if (!this.settings.enabled || !this.settings.nextRun) return;

    const now = new Date();
    const timeUntilNext = this.settings.nextRun.getTime() - now.getTime();
    
    if (timeUntilNext > 0) {
      this.cronJob = setTimeout(() => {
        this.executeCronJob();
      }, timeUntilNext);
      
      console.log(`📅 Cron job scheduled for ${this.settings.nextRun.toLocaleString()}`);
    }
  }

  private stopCronJob(): void {
    if (this.cronJob) {
      clearTimeout(this.cronJob);
      this.cronJob = null;
    }
  }

  private async executeCronJob(): Promise<void> {
    console.log('🔄 Executing scheduled data sync...');
    
    this.settings.lastRun = new Date();
    this.calculateNextRun();
    localStorage.setItem('cronSettings', JSON.stringify(this.settings));
    
    // Trigger the sync event
    window.dispatchEvent(new CustomEvent('cronJobExecuted', {
      detail: { timestamp: this.settings.lastRun }
    }));
    
    // Schedule next run
    this.startCronJob();
  }

  // Manual trigger for testing
  triggerManualSync(): void {
    console.log('🔄 Manual sync triggered...');
    this.executeCronJob();
  }

  getTimeUntilNextRun(): string {
    if (!this.settings.enabled || !this.settings.nextRun) {
      return 'Disabled';
    }

    const now = new Date();
    const diff = this.settings.nextRun.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Running soon...';
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m`;
  }
}

export const cronService = CronService.getInstance();