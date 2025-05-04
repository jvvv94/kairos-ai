'use client';

import { motion } from 'framer-motion';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

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

// 테스트용 더미 데이터
const dummyFeedback = {
  details: [
    {
      category: "전문성",
      score: 4.5,
      evaluation: "기술적 지식이 매우 풍부하며, 실무 경험을 바탕으로 한 구체적인 답변이 인상적입니다. 특히 프론트엔드 개발에서의 성능 최적화와 사용자 경험 개선에 대한 이해가 돋보입니다.",
      improvement: "최신 웹 기술 트렌드와 성능 최적화 기법에 대해 더 구체적인 사례를 준비하면 좋겠습니다."
    },
    {
      category: "의사소통 능력",
      score: 4.0,
      evaluation: "논리적이고 명확한 답변 구조를 가지고 있으며, 전문적인 내용을 이해하기 쉽게 설명하는 능력이 우수합니다.",
      improvement: "긴장된 상황에서도 더 자신감 있는 태도로 의견을 전달하면 좋겠습니다."
    },
    {
      category: "문제 해결력",
      score: 4.5,
      evaluation: "복잡한 기술적 문제에 대한 분석력과 해결 능력이 뛰어나며, 다양한 관점에서 문제를 바라보는 시각이 인상적입니다.",
      improvement: "문제 해결 과정에서 고려한 다른 대안들도 함께 언급하면 더 좋을 것 같습니다."
    },
    {
      category: "태도 및 열정",
      score: 5.0,
      evaluation: "면접 전반에 걸쳐 높은 열정과 긍정적인 태도를 보여주었으며, 지속적인 자기 개발에 대한 의지가 돋보입니다.",
      improvement: null
    },
    {
      category: "직무 적합성",
      score: 4.5,
      evaluation: "프론트엔드 개발자로서의 역량과 경험이 직무 요구사항과 매우 잘 부합합니다. 특히 사용자 중심의 개발 철학이 인상적입니다.",
      improvement: "회사의 제품과 기술 스택에 대한 더 깊은 이해를 보여주면 좋겠습니다."
    }
  ],
  overallScore: 4.5,
  summary: "전반적으로 매우 우수한 면접 수행을 보여주었습니다. 특히 기술적 전문성과 문제 해결 능력이 돋보이며, 열정적이고 긍정적인 태도가 인상적입니다. 프론트엔드 개발자로서의 경험과 역량이 충분히 검증되었으며, 회사의 성장에 크게 기여할 수 있을 것으로 기대됩니다. 일부 개선이 필요한 부분들은 실무 경험을 통해 충분히 보완될 수 있을 것으로 판단됩니다."
};

export default function InterviewAnalysisTest() {
  const router = useRouter();

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
              <StarRating score={dummyFeedback.overallScore} />
            </div>
          </div>
          
          <div className="grid gap-6">
            {dummyFeedback.details.map((detail, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
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
            <p className="text-gray-700 whitespace-pre-line">{dummyFeedback.summary}</p>
          </div>

          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/interview/test/feedback')}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              테스트 페이지로 돌아가기
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 