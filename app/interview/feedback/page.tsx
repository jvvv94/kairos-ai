'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';

interface FeedbackDetail {
  category: string;
  score: number;
  evaluation: string;
  improvement?: string;
}

interface InterviewFeedback {
  details: FeedbackDetail[];
  overallScore: number;
  summary: string;
}

const StarRating = ({ score }: { score: number }) => {
  const stars = [];
  const fullStars = Math.floor(score);
  const hasHalfStar = score % 1 >= 0.5;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(<FaStarHalf key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {stars}
      <span className="ml-2 text-sm text-gray-600">
        ({score.toFixed(1)}/5.0)
      </span>
    </div>
  );
};

const LoadingDots = () => (
  <div className="flex space-x-1 ml-2">
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.5, delay: 0.1, repeat: Infinity, repeatType: "reverse" }}
    />
    <motion.div
      className="w-2 h-2 bg-blue-500 rounded-full"
      animate={{ y: [0, -5, 0] }}
      transition={{ duration: 0.5, delay: 0.2, repeat: Infinity, repeatType: "reverse" }}
    />
  </div>
);

export default function FeedbackPage() {
  const router = useRouter();
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        // sessionStorage에서 면접 데이터 불러오기
        const interviewDataStr = sessionStorage.getItem('interviewData');
        if (!interviewDataStr) {
          throw new Error('면접 데이터를 찾을 수 없습니다.');
        }

        const interviewData = JSON.parse(interviewDataStr);
        console.log('📊 면접 데이터 로드:', interviewData);

        // 피드백 요청
        const response = await fetch('/api/interview/feedback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(interviewData),
        });

        if (!response.ok) {
          throw new Error('피드백을 가져오는데 실패했습니다.');
        }

        const feedbackData = await response.json();
        console.log('✅ 피드백 데이터 수신:', feedbackData);
        setFeedback(feedbackData);
      } catch (error) {
        console.error('❌ 피드백 로드 실패:', error);
        setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    loadFeedback();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <p className="text-lg text-gray-600 mb-4">면접 분석 중입니다...</p>
        <LoadingDots />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-red-50 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <div className="bg-yellow-50 rounded-lg p-6 text-center">
          <p className="text-yellow-600 mb-4">피드백 데이터를 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">면접 평가 결과</h2>
            <div className="flex items-center">
              <span className="text-lg font-semibold mr-3">종합 평가:</span>
              <StarRating score={feedback.overallScore} />
            </div>
          </div>
          
          <div className="grid gap-6">
            {feedback.details.map((detail, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{detail.category}</h3>
                  <StarRating score={detail.score} />
                </div>
                <p className="text-gray-600 mb-3">{detail.evaluation}</p>
                {detail.improvement && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <span className="font-semibold">개선 제안:</span> {detail.improvement}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">총평</h3>
            <p className="text-gray-700 whitespace-pre-line">{feedback.summary}</p>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 