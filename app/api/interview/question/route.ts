import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import companyInfo from '@/app/data/companyInfo.json';
import { CompanyInfo, Job } from '@/app/types/company';
import { useState } from 'react';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Kairos 어시스턴트 ID 환경변수
const KAIROS_ASSISTANT_ID = process.env.KAIROS_ASSISTANT_ID;

// Custom GPT ID는 Assistant API에서 직접 사용할 수 없으므로,
// Assistant를 생성하고 관리하는 함수
async function getOrCreateAssistant() {
  try {
    console.log('[Assistant] Assistant 초기화 시작');
    
    // 기존 어시스턴트 ID가 있는 경우 재사용
    if (KAIROS_ASSISTANT_ID) {
      try {
        console.log('[Assistant] 기존 Assistant 조회 시도:', KAIROS_ASSISTANT_ID);
        const assistant = await openai.beta.assistants.retrieve(KAIROS_ASSISTANT_ID);
        console.log('[Assistant] 기존 Assistant 조회 성공:', {
          id: assistant.id,
          model: assistant.model,
          name: assistant.name
        });
        return assistant;
      } catch (error) {
        console.warn('[Assistant] 기존 Assistant 조회 실패, 새로 생성 필요:', error);
      }
    }

    // 새로운 assistant 생성
    console.log('[Assistant] 새로운 Assistant 생성 시작 - 사용 모델: gpt-4o');
    const assistant = await openai.beta.assistants.create({
      name: "AI 면접관 Kairos",
      instructions: `당신은 Kairos라는 이름의 전문 AI 면접관입니다.
      지원자의 이력서 요약과 채용공고(JD)를 참고하여 직무 적합성과 전문성을 평가합니다.
      
      사전 준비: 이력서 요약과 JD를 검토하여 주요 경험과 역량을 파악합니다.
      
      기본 질문 내용:
      - 1분 자기소개
      - 회사 지원동기
      - 성격의 장점
      - 성격의 단점 2개
      - 직무 수행 관련 강점
      - 지원자가 경험했던 가장 중요한 도전 경험
      - 지원자의 가장 큰 실패 경험과 그 것을 극복한 방법
      - 지원자가 프로젝트 중 갈등을 해결한 경험
      - 지원자의 팀워크 경험
      - 입사 후 포부
      - 마지막으로 하고 싶은 말
      
      질문 전략:
      1. 기본 질문을 참고하되, 다음과 같은 방식으로 질문을 변형하고 응용하세요:
         - 지원자의 답변 내용에 따라 구체적인 상황이나 예시를 요청
         - 직무 관련 기술이나 지식을 검증하는 심화 질문 추가
         - 유사한 상황에서의 대처 방법을 묻는 응용 질문
         - 실제 업무 상황을 가정한 문제 해결 질문
         - 지원자가 제출한 파일의 내용을 참고하여 기재된 내용에 대해 질문
      
      2. 답변 분석과 후속 질문:
         - 지원자가 언급한 프로젝트나 기술에 대해 더 깊이 있는 설명 요청
         - 의사결정 과정이나 문제 해결 방법에 대한 구체적인 설명 요구
         - 팀 협업이나 갈등 상황에서의 구체적인 역할과 기여도 확인
         - 전문 용어나 기술을 언급했을 때 관련 지식 검증
      
      3. 맥락 기반 질문:
         - JD의 필수/우대 요건과 연관된 경험이나 역량을 확인하는 질문
         - 회사의 제품/서비스와 관련된 기술적 이해도 확인
         - 직무 특성에 맞는 실제 상황 기반 문제 해결 능력 평가
      
      면접 진행 방식:
      - 정해진 순서를 고집하지 말고 자연스러운 대화 흐름을 따르세요
      - 지원자의 답변에서 흥미로운 포인트를 포착하여 깊이 있는 대화로 발전시키세요
      - 기본 질문들을 참고하되, 각 면접마다 다른 방식으로 접근하세요
      - 직무와 관련된 실무적인 질문을 적절히 혼합하세요
      
      답변 평가:
      - 논리성: 답변의 구조와 흐름이 명확한가
      - 구체성: 실제 경험과 상황을 상세히 설명하는가
      - 전문성: 직무 관련 지식과 기술을 정확히 이해하고 있는가
      - 문제해결력: 어려운 상황에서의 대처 능력과 창의성
      - 성장가능성: 학습 의지와 발전 가능성
      - 태도: 지원자의 답변 태도, 의성어 사용 빈도 등 답변 내용에 대한 태도 평가
      
      커뮤니케이션:
      - 전문적이면서도 친근한 태도를 유지하세요
      - 지원자의 답변을 경청하고 적절한 후속 질문을 제시하세요
      - 필요한 경우 질문의 의도나 맥락을 명확히 설명하세요
      - 답변과 질문은 짧고 명확하게 작성해주세요
      
      면접 종료: 10번째 질문 답변 후 반드시 "Interview completed"를 출력합니다.`,
      model: "gpt-4o",
    });

    console.log('[Assistant] 새로운 Assistant 생성 완료:', {
      id: assistant.id,
      model: assistant.model,
      name: assistant.name,
      created_at: new Date(assistant.created_at * 1000).toISOString()
    });

    // 여기서 생성된 assistant.id를 환경 변수나 DB에 저장하는 로직 추가 필요
    console.log('[Assistant] 새로 생성된 Assistant ID를 환경 변수에 저장 필요:', assistant.id);

    return assistant;
  } catch (error) {
    console.error('[Assistant] Assistant 초기화 실패:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}

// 토큰 사용량 모니터링을 위한 함수 추가
function calculateApproximateTokens(text: string): number {
  // 대략적인 토큰 수 계산 (영어 기준 1토큰 ≈ 4글자)
  return Math.ceil(text.length / 4);
}

// summarizeInterviewContext 함수 수정
function summarizeInterviewContext(company: any, job: any, resumeContent?: string) {
  const context = {
    company: `${company.name} (${company.industry})`,
    job: {
      title: job.title,
      keyResponsibilities: job.responsibilities.slice(0, 3).join(', '),
      keyRequirements: job.requirements.slice(0, 3).join(', '),
      keyPreferences: job.preferences.slice(0, 2).join(', ')
    },
    resume: resumeContent ? (resumeContent.length > 500 ? `${resumeContent.substring(0, 500)}...` : resumeContent) : ''
  };

  // 토큰 사용량 로깅
  const originalTokens = calculateApproximateTokens(JSON.stringify({ company, job, resumeContent }));
  const summarizedTokens = calculateApproximateTokens(JSON.stringify(context));
  
  console.log('토큰 사용량 비교:', {
    original: originalTokens,
    summarized: summarizedTokens,
    reduction: `${((originalTokens - summarizedTokens) / originalTokens * 100).toFixed(1)}%`
  });

  // 요약 내용 콘솔 출력
  console.log('[DEBUG][summarizeInterviewContext] 실제 GPT에 전달되는 요약 context:', context);

  return context;
}

// 첫 질문 목록
const initialQuestions = {
  '1': '안녕하세요, 지원자님! 오늘 면접을 진행할 AI 면접관 Kairos입니다. 먼저 준비해오신 1분 자기소개를 해주세요. 긴장하지 마시고 자연스럽게 말씀해주세요.'
} as const;

type CompanyId = keyof typeof initialQuestions;

interface InterviewRequest {
  companyId: string;
  jobId: string;
  previousAnswers?: { question: string; answer: string; }[];
  threadId?: string;
  resumeContent?: string;
}

export async function POST(req: Request) {
  let currentThread;
  
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않음');
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // Assistant 가져오기 또는 생성
    const assistant = await getOrCreateAssistant();
    console.log('🤖 Assistant 준비 완료:', assistant.id);

    const body = await req.json() as InterviewRequest;
    const { companyId, jobId, previousAnswers, threadId, resumeContent } = body;

    console.log('📝 요청 데이터:', {
      companyId,
      jobId,
      hasThreadId: !!threadId,
      hasPreviousAnswers: !!previousAnswers,
      answersCount: previousAnswers?.length,
      hasResumeContent: !!resumeContent
    });

    if (!companyId || !jobId) {
      return NextResponse.json(
        { error: '회사 ID와 직무 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const typedCompanyInfo = companyInfo as CompanyInfo;
    const company = typedCompanyInfo.companies[companyId];
    const job = company?.jobs[jobId] as Job | undefined;

    if (!company || !job) {
      return NextResponse.json(
        { error: '유효하지 않은 회사 또는 직무 ID입니다.' },
        { status: 400 }
      );
    }

    // Thread 초기화
    if (threadId) {
      // 기존 스레드가 있는 경우 조회
      console.log('[API] 기존 스레드 조회:', threadId);
      currentThread = await openai.beta.threads.retrieve(threadId);
      console.log('[API] Thread 메타데이터:', currentThread.metadata);
    } else if (!previousAnswers) {
      // 새로운 스레드 생성 (첫 질문인 경우)
      console.log('[API] 새 스레드 생성 시도');
      currentThread = await openai.beta.threads.create({
        metadata: {
          interview_id: Date.now().toString(),
          company_id: companyId,
          job_id: jobId,
          start_time: new Date().toISOString(),
          assistant_id: assistant.id
        }
      });
      console.log('[API] 새 thread 생성:', {
        id: currentThread.id,
        metadata: currentThread.metadata
      });
    } else {
      return NextResponse.json(
        { error: '유효하지 않은 요청입니다.' },
        { status: 400 }
      );
    }

    // 면접 종료 조건 체크
    if (previousAnswers && previousAnswers.length >= 10) {
      try {
        // 면접 총평을 위한 새로운 메시지 전송
        await openai.beta.threads.messages.create(currentThread.id, {
          role: 'user',
          content: `면접이 완료되었습니다. 지원자의 모든 답변을 분석하여 아래 형식으로 총평을 작성해주세요. 마크다운 문법은 사용하지 말고, 각 항목별로 이모지와 plain text로 구분해서 작성하세요.\n\n📝 직무 적합성 평가\n- JD의 필수 요건 충족도\n- JD의 우대사항 보유 여부\n- 실무 경험의 관련성과 깊이\n\n💡 전문성 평가\n- 직무 관련 지식과 기술력\n- 문제 해결 능력과 접근 방식\n- 업무 프로세스 이해도\n\n🌱 발전 가능성 평가\n- 자기 개발 의지와 학습능력\n- 창의성과 혁신성\n- 도전 정신과 성장 가능성\n\n🤝 조직 적합성 평가\n- 커뮤니케이션 능력\n- 팀워크와 협업 능력\n- 회사와 직무에 대한 이해도\n\n🏅 강점 및 보완점\n- 주요 강점 3가지\n- 보완이 필요한 부분 2가지\n- 개선을 위한 구체적인 제안\n\n답변 내용:\n${previousAnswers.map((qa, index) => `\n[질문 ${index + 1}]\nQ: ${qa.question}\nA: ${qa.answer}\n`).join('\n')}\n\n직무 정보:\n회사: ${company.name}\n직무: ${job.title}\n직무 설명: ${job.description}\n수행 업무: ${job.responsibilities.join(', ')}\n자격 요건: ${job.requirements.join(', ')}\n우대 사항: ${job.preferences.join(', ')}`
        });

        // 총평 생성을 위한 GPT 실행
        const run = await openai.beta.threads.runs.create(currentThread.id, {
          assistant_id: assistant.id,
        });

        // 실행 완료 대기
        let completedRun;
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
          const runStatus = await openai.beta.threads.runs.retrieve(
            currentThread.id,
            run.id
          );
          
          if (runStatus.status === 'completed') {
            completedRun = runStatus;
            break;
          } else if (runStatus.status === 'failed' || runStatus.status === 'expired' || runStatus.status === 'cancelled') {
            throw new Error(`총평 생성 실패: ${runStatus.status}`);
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!completedRun) {
          throw new Error('총평 생성 시간 초과');
        }

        // 총평 메시지 가져오기
        const messages = await openai.beta.threads.messages.list(currentThread.id);
        const feedbackMessage = messages.data[0];

        if (!feedbackMessage || !feedbackMessage.content || feedbackMessage.content.length === 0) {
          throw new Error('총평 메시지가 비어있습니다.');
        }

        if (feedbackMessage.content[0].type !== 'text') {
          throw new Error('예상치 못한 메시지 형식입니다.');
        }

        return NextResponse.json({ 
          message: 'Interview completed',
          summary: '면접이 종료되었습니다.\n\n[답변 분석 확인하기] 버튼을 클릭하여 면접 총평을 확인하실 수 있습니다.',
          feedback: feedbackMessage.content[0].text.value,
          showFeedbackButton: true,
          hideAnswerInput: true
        });

      } catch (error: any) {
        console.error('총평 생성 중 오류:', error);
        return NextResponse.json(
          { 
            message: 'Interview completed',
            summary: '면접이 완료되었습니다. 수고하셨습니다.',
            error: '총평 생성 중 오류가 발생했습니다.',
            hideAnswerInput: true
          }
        );
      }
    }

    // 첫 질문인 경우
    if (!previousAnswers) {
      console.log('[API] 첫 질문 생성 시도');
      try {
        // 첫 메시지 전송
        const contextMessage = `면접을 시작합니다. 다음 내용을 참고하여 첫 질문으로 1분 자기소개를 요청해주세요.\n\n회사: ${company.name}\n직무: ${job.title}\n직무 설명: ${job.description}\n수행 업무: ${job.responsibilities.join(', ')}\n자격 요건: ${job.requirements.join(', ')}\n우대 사항: ${job.preferences.join(', ')}\n${resumeContent ? `이력서 내용: ${resumeContent}\n` : ''}`;

        // 실제 GPT로 전달되는 프롬프트 콘솔 출력
        console.log('[DEBUG][API] 첫 질문 생성 프롬프트:', contextMessage);

        await openai.beta.threads.messages.create(currentThread.id, {
          role: 'user',
          content: contextMessage
        });

        // Assistant로 첫 질문 생성
        console.log('[API] 첫 질문 생성을 위한 run 시작');
        const run = await openai.beta.threads.runs.create(currentThread.id, {
          assistant_id: assistant.id
        });
        console.log('[API] 첫 질문 run 생성됨:', run.id);

        // 실행 완료 대기
        let completedRun;
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
          const runStatus = await openai.beta.threads.runs.retrieve(
            currentThread.id,
            run.id
          );
          console.log('[API] run 상태:', runStatus.status);
          
          if (runStatus.status === 'completed') {
            completedRun = runStatus;
            break;
          } else if (runStatus.status === 'failed' || runStatus.status === 'expired' || runStatus.status === 'cancelled') {
            throw new Error(`첫 질문 생성 실패: ${runStatus.status}`);
          }
          
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (!completedRun) {
          throw new Error('첫 질문 생성 시간 초과');
        }

        // 생성된 첫 질문 가져오기
        const messages = await openai.beta.threads.messages.list(currentThread.id);
        const firstMessage = messages.data[0];
        
        if (!firstMessage || !firstMessage.content || firstMessage.content.length === 0) {
          throw new Error('첫 질문 메시지가 비어있습니다.');
        }

        if (firstMessage.content[0].type !== 'text') {
          throw new Error('예상치 못한 메시지 형식입니다.');
        }

        const firstQuestion = firstMessage.content[0].text.value;
        console.log('[API] 첫 질문 생성 완료:', firstQuestion);

        return NextResponse.json({
          question: firstQuestion,
          threadId: currentThread.id,
          questionCount: 1
        });
      } catch (error: any) {
        console.error('[API][ERROR] 초기화 실패:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
          { error: '면접 초기화 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }

    // 중간 질문 처리
    try {
      // 중복 run 방지: active run이 있는지 확인
      const runsList = await openai.beta.threads.runs.list(currentThread.id, { limit: 5 });
      const activeRun = runsList.data.find(run => run.status === 'queued' || run.status === 'in_progress' || run.status === 'requires_action');
      if (activeRun) {
        console.warn('[API][WARN] active run 존재:', activeRun.id, activeRun.status);
        return NextResponse.json(
          { error: '이전 답변 처리가 아직 완료되지 않았습니다. 잠시 후 다시 시도해주세요.' },
          { status: 400 }
        );
      }

      if (previousAnswers && previousAnswers.length > 0) {
        const lastAnswer = previousAnswers[previousAnswers.length - 1];
        const context = summarizeInterviewContext(company, job, resumeContent);

        // 답변 전송
        const answerMessage = `회사: ${context.company}\n직무: ${context.job.title}\n주요 업무: ${context.job.keyResponsibilities}\n필수 요건: ${context.job.keyRequirements}\n우대 사항: ${context.job.keyPreferences}\n${context.resume ? `이력서 요약: ${context.resume}\n` : ''}\n현재 질문 수: ${previousAnswers.length}\n답변: ${lastAnswer.answer}`;

        // 실제 GPT로 전달되는 프롬프트 콘솔 출력
        console.log('[DEBUG][API] 추가 질문 생성 프롬프트:', answerMessage);

        await openai.beta.threads.messages.create(currentThread.id, {
          role: 'user',
          content: answerMessage
        });
      }

      // Thread 메타데이터에서 assistant_id 가져오기
      const metadata = currentThread.metadata;
      const assistantId = metadata?.assistant_id || assistant.id;

      console.log('[API] run 생성 시도');
      const run = await openai.beta.threads.runs.create(currentThread.id, {
        assistant_id: assistantId
      });
      console.log('[API] run 생성 완료:', run.id);

      // 실행 완료 대기
      let completedRun;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (attempts < maxAttempts) {
        const runStatus = await openai.beta.threads.runs.retrieve(
          currentThread.id,
          run.id
        );
        console.log('[API] run 상태 polling:', runStatus.status);
        if (runStatus.status === 'completed') {
          completedRun = runStatus;
          break;
        } else if (runStatus.status === 'failed' || runStatus.status === 'expired' || runStatus.status === 'cancelled') {
          console.error('[API][ERROR] run 실패:', runStatus.status);
          throw new Error(`OpenAI 실행 실패: ${runStatus.status}`);
        }
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (!completedRun) {
        console.error('[API][ERROR] run 완료 시간 초과');
        throw new Error('OpenAI 실행 시간 초과');
      }

      console.log('[API] run 완료');
      const messages = await openai.beta.threads.messages.list(currentThread.id);
      const lastMessage = messages.data[0];

      if (!lastMessage || !lastMessage.content || lastMessage.content.length === 0) {
        console.error('[API][ERROR] 응답 메시지 없음');
        throw new Error('응답 메시지가 비어있습니다.');
      }

      if (lastMessage.content[0].type !== 'text') {
        console.error('[API][ERROR] 메시지 타입 text 아님');
        throw new Error('예상치 못한 메시지 형식입니다.');
      }

      const question = lastMessage.content[0].text.value;
      const questionCount = (previousAnswers?.length || 0) + 1;
      console.log('[API] 다음 질문 반환:', { question, questionCount });

      if (questionCount === 10) {
        return NextResponse.json({
          message: "Interview completed",
          summary: "수고하셨습니다. 충분한 시간을 가지고 고민해보시고 답변해 주시면 됩니다. 마지막으로, 삼성전자에 입사하게 된다면 어떤 포부를 가지고 일하고 싶으신지 말씀 좀 해주시겠습니까? 데이터를 통해 기업의 경쟁력을 강화하고자 하는 어려분의 비전이나 목표가 있다면 알려주시면 좋겠습니다. (이번이 마지막 질문입니다. 답변해 주시면 답변 분석이 시작됩니다.)",
          threadId: currentThread.id,
          questionCount,
          isLastQuestion: true,
          showFeedbackButton: false
        });
      }

      return NextResponse.json({
        question,
        threadId: currentThread.id,
        questionCount
      });

    } catch (error: any) {
      console.error('[API][ERROR] OpenAI API 오류:', error);
      return NextResponse.json(
        { error: error.message || 'OpenAI API 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: error.message || '서버 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
} 