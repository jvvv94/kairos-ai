'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '../../../../store/authStore';

export default function KakaoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const setAuth = useAuthStore(state => state.setAuth);

  useEffect(() => {
    console.log('카카오 콜백 페이지 진입');
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    
    console.log('URL 파라미터:', { code, error });
    
    if (error) {
      console.error('카카오 로그인 에러:', error);
      setError('로그인이 취소되었습니다.');
      setTimeout(() => {
        router.push('/login');
      }, 3000);
      return;
    }

    if (code) {
      console.log('카카오 인증 코드 수신, API 요청 시작');
      fetch('/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
      .then(response => {
        console.log('API 응답 상태:', response.status);
        if (!response.ok) {
          console.error('API 응답 에러:', response.statusText);
          return response.json().then(err => {
            console.error('API 에러 상세:', err);
            throw new Error(err.error || '로그인에 실패했습니다.');
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('API 응답 데이터:', data);
        if (data.error) {
          console.error('API 응답 에러:', data.error);
          throw new Error(data.error);
        }
        console.log('인증 정보 저장 시작:', data.user);
        setAuth(data.user, data.token, data.expiresIn);
        console.log('인증 정보 저장 완료, 페이지 이동 준비');
        setTimeout(() => {
          console.log('company-selection 페이지로 이동');
          router.push('/company-selection');
        }, 1000);
      })
      .catch(error => {
        console.error('로그인 처리 중 에러 발생:', error);
        setError(error.message || '로그인 처리 중 오류가 발생했습니다.');
        setTimeout(() => {
          console.log('로그인 페이지로 이동');
          router.push('/login');
        }, 3000);
      });
    }
  }, [searchParams, router, setAuth]);

  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-red-500">
            <h1 className="text-2xl font-bold mb-4">{error}</h1>
            <p className="text-gray-600">잠시 후 로그인 페이지로 이동합니다...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-4">로그인 중입니다...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-600 mt-4">잠시만 기다려주세요.</p>
          </>
        )}
      </div>
    </main>
  );
} 