'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const approvePayment = async () => {
      try {
        const pg_token = searchParams.get('pg_token');
        const tid = localStorage.getItem('tid');
        const partner_order_id = localStorage.getItem('partner_order_id');
        const partner_user_id = localStorage.getItem('partner_user_id');

        if (!pg_token || !tid || !partner_order_id || !partner_user_id) {
          throw new Error('결제 정보가 없습니다.');
        }

        const response = await fetch('/api/payment/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pg_token,
            tid,
            partner_order_id,
            partner_user_id
          })
        });

        const data = await response.json();
        if (data.tid) {
          setIsSuccess(true);
          // 결제 성공 후 필요한 처리 (예: 구독 정보 업데이트)
        } else {
          throw new Error('결제 승인에 실패했습니다.');
        }
      } catch (error) {
        console.error('Payment approval error:', error);
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    approvePayment();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">결제를 처리 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        {isSuccess ? (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-4">결제가 완료되었습니다!</h1>
            <p className="text-gray-600 mb-8">AI 인터뷰 서비스를 이용해보세요.</p>
            <button
              onClick={() => router.push('/company-selection')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              서비스 이용하기
            </button>
          </>
        ) : (
          <>
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-4">결제에 실패했습니다</h1>
            <p className="text-gray-600 mb-8">다시 시도해주세요.</p>
            <button
              onClick={() => router.push('/payment')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold"
            >
              다시 결제하기
            </button>
          </>
        )}
      </div>
    </div>
  );
} 