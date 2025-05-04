'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/payment/ready', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: selectedPlan === 'monthly' ? 3300 : 33000,
          user_id: localStorage.getItem('user_id')
        })
      });

      const data = await response.json();
      if (data.next_redirect_pc_url) {
        window.location.href = data.next_redirect_pc_url;
      } else {
        throw new Error('결제 URL을 받아오지 못했습니다.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      alert('결제 준비 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">구독 플랜 선택</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 border rounded-lg cursor-pointer ${
            selectedPlan === 'monthly' ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={() => setSelectedPlan('monthly')}
        >
          <h2 className="text-xl font-bold mb-2">월간 구독</h2>
          <p className="text-3xl font-bold mb-4">3,300원</p>
          <ul className="space-y-2">
            <li>• 무제한 AI 인터뷰</li>
            <li>• 다양한 기업별 질문</li>
            <li>• 실시간 피드백</li>
          </ul>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-6 border rounded-lg cursor-pointer ${
            selectedPlan === 'yearly' ? 'border-blue-500' : 'border-gray-200'
          }`}
          onClick={() => setSelectedPlan('yearly')}
        >
          <h2 className="text-xl font-bold mb-2">연간 구독</h2>
          <p className="text-3xl font-bold mb-4">33,000원</p>
          <p className="text-green-500 mb-4">2개월 무료!</p>
          <ul className="space-y-2">
            <li>• 월간 구독의 모든 혜택</li>
            <li>• 우선 지원</li>
            <li>• 추가 혜택 제공</li>
          </ul>
        </motion.div>
      </div>

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="mt-8 w-full bg-blue-500 text-white py-4 rounded-lg font-bold text-lg disabled:bg-gray-400"
      >
        {isLoading ? '결제 준비 중...' : '결제하기'}
      </button>
    </div>
  );
} 