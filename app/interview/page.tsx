'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewRoom from '../components/InterviewRoom';

export default function InterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);

  // URL 파라미터에서 company와 job ID 가져오기
  const companyId = searchParams.get('company');
  const jobId = searchParams.get('job');

  useEffect(() => {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // company나 job ID가 없으면 기업 선택 페이지로 리다이렉트
    if (!companyId || !jobId) {
      router.push('/company-selection');
      return;
    }

    setIsLoading(false);
  }, [companyId, jobId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600 mt-4">면접을 준비하고 있습니다...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <InterviewRoom
        companyId={companyId || ''}
        jobId={jobId || ''}
      />
    </main>
  );
} 