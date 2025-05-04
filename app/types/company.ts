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

// JSON 파일의 타입 선언
declare module '@/app/data/companyInfo.json' {
  const value: CompanyInfo;
  export default value;
} 