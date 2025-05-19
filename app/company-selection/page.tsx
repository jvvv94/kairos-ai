'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import CompanySelection from '../components/CompanySelection';
import JobSelection from '../components/JobSelection';
import InterviewGuide from '../components/InterviewGuide';
import InterviewReadyScreen from '../components/InterviewReadyScreen';
import { useAuthStore } from '../../store/authStore';

type Step = 'company' | 'job' | 'guide';

export default function CompanySelectionPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('company');
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedResumeContent, setUploadedResumeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const authStore = useAuthStore();
  const hydrated = useAuthStore((state) => state.hydrated);
  const [showReadyScreen, setShowReadyScreen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    const checkAuth = async () => {
      try {
        console.log('인증 상태 체크 시작');
        const state = useAuthStore.getState();
        console.log('현재 토큰:', state.token);
        console.log('현재 만료시간:', state.tokenExpiry);
        
        const isValid = state.token && state.tokenExpiry && state.tokenExpiry > Date.now();
        
        if (!isValid) {
          console.log('인증되지 않음, 토큰 갱신 시도');
          await authStore.refreshToken();
          
          // 토큰 갱신 후 다시 체크
          const newState = useAuthStore.getState();
          const isValidAfterRefresh = newState.token && 
            newState.tokenExpiry && 
            newState.tokenExpiry > Date.now();
            
          if (!isValidAfterRefresh) {
            console.log('토큰 갱신 실패, 로그인으로 이동');
            authStore.clearAuth();
            router.push('/login');
            return;
          }
        }
        
        console.log('인증 성공');
        setIsLoading(false);
      } catch (error) {
        console.error('인증 체크 중 에러 발생:', error);
        authStore.clearAuth();
        router.push('/login');
      }
    };

    checkAuth();
  }, [hydrated, router, authStore]);

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompany(companyId);
  };

  const handleJobSelect = (jobId: string) => {
    setSelectedJob(jobId);
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const handleCompanyNext = () => {
    setStep('job');
  };

  const handleJobNext = () => {
    setStep('guide');
  };

  const handleGuideNext = () => {
    setShowReadyScreen(true);
  };

  const handleEnterInterview = () => {
    router.push(`/interview?company=${selectedCompany}&job=${selectedJob}`);
  };

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600 mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {!showReadyScreen ? (
        <main className="min-h-screen bg-white flex flex-col items-center">
          {/* 단계별 컴포넌트 */}
          <div className="w-full flex-1 flex flex-col items-center">
            <div className="w-full max-w-2xl px-4">
              {step === 'company' && (
                <CompanySelection
                  onCompanySelect={handleCompanySelect}
                  onNext={handleCompanyNext}
                />
              )}
              {step === 'job' && (
                <JobSelection
                  companyId={selectedCompany}
                  onJobSelect={handleJobSelect}
                  onNext={handleJobNext}
                />
              )}
              {step === 'guide' && (
                <InterviewGuide
                  onFileUpload={handleFileUpload}
                  onNext={handleGuideNext}
                />
              )}
            </div>
          </div>
        </main>
      ) : (
        <InterviewReadyScreen
          resumeContent={uploadedResumeContent}
          onEnter={handleEnterInterview}
        />
      )}
    </>
  );
} 