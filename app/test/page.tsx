'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [clientId, setClientId] = useState<string>('');
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    setClientId(process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || '설정되지 않음');
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-2xl font-bold mb-4">카카오 로그인 설정 테스트</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">NEXT_PUBLIC_KAKAO_CLIENT_ID</h2>
          <p className="font-mono">{clientId}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold mb-2">Redirect URI</h2>
          <p className="font-mono">{origin ? `${origin}/auth/kakao/callback` : ''}</p>
        </div>

        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${clientId}&redirect_uri=${window.location.origin}/auth/kakao/callback&response_type=code`;
              window.location.href = KAKAO_AUTH_URL;
            }
          }}
          className="px-4 py-2 bg-[#FEE500] text-black rounded-lg hover:bg-[#FDD800] transition-colors"
        >
          카카오 로그인 테스트
        </button>
      </div>
    </div>
  );
} 