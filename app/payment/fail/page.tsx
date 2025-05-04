'use client';

import { useRouter } from 'next/navigation';

export default function PaymentFail() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-500 text-6xl mb-4">✗</div>
        <h1 className="text-2xl font-bold mb-4">결제에 실패했습니다</h1>
        <p className="text-gray-600 mb-8">다시 시도해주세요.</p>
        <button
          onClick={() => router.push('/payment')}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
        >
          다시 결제하기
        </button>
      </div>
    </div>
  );
} 