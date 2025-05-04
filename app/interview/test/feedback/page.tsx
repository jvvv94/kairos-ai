'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function InterviewFeedbackTest() {
  const router = useRouter();
  const [showFeedbackButton, setShowFeedbackButton] = useState(false);
  const [hideAnswerInput, setHideAnswerInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 캐노피 효과를 위한 ref
  const confettiRef = useRef<any>(null);

  const fireConfetti = useCallback(() => {
    // 중앙에서 터지는 캐노피
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // 왼쪽에서 터지는 캐노피
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });

    // 오른쪽에서 터지는 캐노피
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, []);

  const handleSuccessTest = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/interview/test/feedback');
      const data = await response.json();
      
      setShowFeedbackButton(data.showFeedbackButton);
      setHideAnswerInput(data.hideAnswerInput);
      
      // 캐노피 효과 실행
      setTimeout(() => {
        fireConfetti();
      }, 100);
    } catch (error) {
      console.error('테스트 중 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 테스트용 더미 데이터
  const dummyAnswers = [
    {
      question: "1분 자기소개를 해주세요.",
      answer: "안녕하세요. 5년차 품질관리 엔지니어 김철수입니다..."
    },
    {
      question: "회사에 지원하게 된 동기는 무엇인가요?",
      answer: "SK하이닉스의 품질 혁신 비전에 깊은 인상을 받았습니다..."
    },
    // ... 8번째 질문까지의 더미 데이터
  ];

  const lastQuestion = {
    question: "마지막으로, 입사 후 포부에 대해 말씀해 주세요.",
    answer: "데이터 기반의 품질 관리 시스템을 구축하여 회사의 경쟁력 향상에 기여하고 싶습니다..."
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">AI 면접</h1>
          <div className="text-sm text-gray-500">
            진행도: 10/10
          </div>
        </div>

        {/* 이전 질문-답변 카드 스택 */}
        <div className="space-y-4 mb-8">
          {dummyAnswers.map((answer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-6 shadow-sm"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">질문 {index + 1}</h3>
                <p className="text-gray-600">{answer.question}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">답변</h3>
                <p className="text-gray-600">{answer.answer}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 현재(마지막) 질문 카드 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${showFeedbackButton ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg p-6 shadow-sm mb-8`}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">현재 질문</h2>
          <p className="text-gray-700 mb-6">{lastQuestion.question}</p>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <p className="text-gray-600">{lastQuestion.answer}</p>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSuccessTest}
              disabled={isLoading}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? '처리 중...' : '답변 제출'}
            </button>
          </div>
        </motion.div>

        {/* 면접 완료 UI */}
        {(showFeedbackButton || hideAnswerInput) && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-blue-50 rounded-lg p-12">
              <div className="flex flex-col items-center justify-center space-y-8">
                <img
                  src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Party%20Popper.png"
                  alt="Party Popper"
                  width="160"
                  height="160"
                  className="mb-2"
                />
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">축하합니다!</h2>
                  <p className="text-gray-600 text-lg">
                    모든 면접 질문에 대한 답변이 완료되었습니다.<br/>
                    아래 버튼을 클릭하여 면접 분석 결과를 확인해보세요.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/interview/test/analysis')}
                  className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg mt-6"
                >
                  면접 분석 확인하기
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
} 