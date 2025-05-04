'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import companyInfo from '@/app/data/companyInfo.json';
import { CompanyInfo, Job } from '@/app/types/company';

interface JobSelectionProps {
  companyId: string;
  onJobSelect: (jobId: string) => void;
  onNext: () => void;
}

const JobSelection = ({ companyId, onJobSelect, onNext }: JobSelectionProps) => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const companies = companyInfo as CompanyInfo;
  const company = companies.companies[companyId];
  
  console.log('🏢 현재 선택된 기업 정보:', {
    companyId,
    companyName: company?.name,
    availableJobs: company?.jobs
  });

  // jobs 객체를 배열로 변환하면서 필요한 정보만 추출
  const availableJobs = company ? Object.entries(company.jobs).map(([id, jobInfo]) => ({
    id,
    title: jobInfo.title,
    description: jobInfo.description
  })) : [];

  const handleJobSelect = (jobId: string) => {
    console.log('💼 선택된 직무:', {
      jobId,
      jobInfo: company?.jobs[jobId],
      companyId,
      companyName: company?.name
    });
    setSelectedJob(jobId);
    onJobSelect(jobId);
  };

  const handleNext = () => {
    console.log('➡️ 다음 단계로 이동 (직무 선택 완료):', {
      selectedJob,
      jobInfo: selectedJob ? company?.jobs[selectedJob] : null,
      companyId,
      companyName: company?.name
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">지원 직무 선택</h1>
        
        <div className="grid grid-cols-1 gap-4">
          {availableJobs.map((job) => (
            <motion.div
              key={job.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleJobSelect(job.id)}
              className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                selectedJob === job.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h2 className="text-xl font-semibold">{job.title}</h2>
              <p className="text-gray-600 mt-2">{job.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!selectedJob}
            className={`px-6 py-3 rounded-lg font-semibold ${
              !selectedJob
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            다음
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default JobSelection; 