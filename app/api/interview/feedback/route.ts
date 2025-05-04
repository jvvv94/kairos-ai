import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface FeedbackDetail {
  category: string;
  score: number;
  evaluation: string;
  improvement?: string;
}

interface FeedbackResponse {
  details: FeedbackDetail[];
  overallScore: number;
  summary: string;
}

// 평가 카테고리 정의
const EVALUATION_CATEGORIES = [
  "전문성",
  "의사소통 능력",
  "문제 해결력",
  "태도 및 열정",
  "직무 적합성"
] as const;

// 점수 보정 함수 (0.5 단위로 반올림)
function normalizeScore(score: number): number {
  return Math.round(score * 2) / 2;
}

// 피드백 데이터 검증 및 보정
function validateAndNormalizeFeedback(feedback: any): FeedbackResponse {
  if (!feedback.details || !Array.isArray(feedback.details)) {
    throw new Error('피드백 형식이 올바르지 않습니다.');
  }

  // 각 카테고리의 점수를 0.5 단위로 보정
  const normalizedDetails = feedback.details.map((detail: FeedbackDetail) => ({
    ...detail,
    score: normalizeScore(detail.score)
  }));

  // 전체 점수 계산 (카테고리별 점수의 평균, 0.5 단위로 보정)
  const overallScore = normalizeScore(
    normalizedDetails.reduce((sum: number, detail: FeedbackDetail) => sum + detail.score, 0) / normalizedDetails.length
  );

  return {
    details: normalizedDetails,
    overallScore,
    summary: feedback.summary
  };
}

export async function POST(request: Request) {
  try {
    const { threadId, answers } = await request.json();

    if (!threadId) {
      return NextResponse.json(
        { error: 'Thread ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: '답변 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 면접 답변들을 하나의 문자열로 변환
    const interviewSummary = answers
      .map((a, i) => `Q${i + 1}: ${a.question}\nA: ${a.answer}`)
      .join('\n\n');

    // GPT에게 구조화된 피드백 요청
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `당신은 전문적인 면접관입니다. 면접자의 답변을 분석하고 다음 카테고리별로 상세한 평가를 제공해주세요:

평가 형식:
{
  "details": [
    {
      "category": "카테고리명",
      "score": 점수(1-5, 반드시 0.5 단위로만 가능. 예: 1.0, 1.5, 2.0, ..., 4.5, 5.0),
      "evaluation": "해당 카테고리에 대한 상세 평가",
      "improvement": "개선을 위한 구체적인 제안"
    }
  ],
  "summary": "전반적인 총평"
}

평가 카테고리 (반드시 다음 순서대로 평가해주세요):
- 전문성: 직무 관련 지식, 경험, 기술적 역량
- 의사소통 능력: 명확성, 논리성, 전달력
- 문제 해결력: 분석력, 창의성, 실행력
- 태도 및 열정: 면접 태도, 열정, 성실성
- 직무 적합성: 직무와의 연관성, 성장 가능성

점수 기준 (반드시 0.5 단위로만 평가):
5.0: 탁월함 (Outstanding)
4.0-4.5: 우수함 (Excellent)
3.0-3.5: 양호함 (Good)
2.0-2.5: 보통 (Fair)
1.0-1.5: 미흡함 (Needs Improvement)

각 카테고리별로 구체적인 예시와 근거를 들어 평가해주세요.
응답은 반드시 유효한 JSON 형식이어야 합니다.
전체 점수는 서버에서 자동으로 계산되므로 포함하지 마세요.`
        },
        {
          role: "user",
          content: `다음은 면접자의 질문과 답변입니다. 분석해주세요:\n\n${interviewSummary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const feedbackContent = completion.choices[0]?.message?.content;

    if (!feedbackContent) {
      throw new Error('피드백을 생성하지 못했습니다.');
    }

    // JSON 파싱 및 데이터 보정
    try {
      const rawFeedback = JSON.parse(feedbackContent);
      const feedback = validateAndNormalizeFeedback(rawFeedback);
      return NextResponse.json(feedback);
    } catch (error) {
      console.error('피드백 파싱 오류:', error);
      throw new Error('피드백 형식이 올바르지 않습니다.');
    }
  } catch (error) {
    console.error('피드백 생성 오류:', error);
    return NextResponse.json(
      { error: '피드백을 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 