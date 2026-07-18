export interface JobData {
  status: string;
  log: string[];
  progress: number;
}

export const activeJobs = new Map<string, JobData>();
