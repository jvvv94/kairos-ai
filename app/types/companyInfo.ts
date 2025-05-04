export interface CompanyInfo {
  companies: {
    [key: string]: {
      name: string;
      jobs: {
        [key: string]: string;
      };
    };
  };
} 