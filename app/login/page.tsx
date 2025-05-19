'use client';

import { motion } from 'framer-motion';
import { RiKakaoTalkFill } from 'react-icons/ri';

export default function Login() {
  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = `${window.location.origin}/auth/kakao/callback`;
    const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    
    window.location.href = KAKAO_AUTH_URL;
  };

  return (
    <main className="min-h-screen bg-white">
      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">로그인</h2>
            <p className="mt-2 text-sm text-gray-600">
              AI 인터뷰 서비스를 시작하세요
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={handleKakaoLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#FEE500] hover:bg-[#FEE500]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FEE500]"
            >
              <RiKakaoTalkFill className="w-5 h-5 mr-2" />
              카카오로 로그인
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 