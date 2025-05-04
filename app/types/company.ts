export interface Job {
  title: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  preferences: string[];
}

export interface Company {
  name: string;
  jobs: {
    [key: string]: Job;
  };
}

export interface CompanyInfo {
  companies: {
    [key: string]: Company;
  };
} 