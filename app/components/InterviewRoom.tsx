'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { IoMicOutline, IoStopOutline, IoRefreshOutline } from 'react-icons/io5';
import { FaStar, FaStarHalf, FaRegStar } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

interface InterviewRoomProps {
  companyId: string;
  jobId: string;
}

interface Answer {
  question: string;
  answer: string;
  isFollowUp?: boolean;
}

interface FeedbackDetail {
  category: string;
  score: number; // 1-5 scale (can be float for half stars)
  evaluation: string;
  improvement?: string;
}

interface InterviewFeedback {
  details: FeedbackDetail[];
  overallScore: number; // 1-5 scale (can be float for half stars)
  summary: string;
}

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

const InterviewRoom = ({ companyId, jobId }: InterviewRoomProps) => {
  const router = useRouter();
  const [isInterviewing, setIsInterviewing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(1);
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeContent, setResumeContent] = useState<string>('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [answerTime, setAnswerTime] = useState(0);
  const [answerTimer, setAnswerTimer] = useState<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRecognitionStartedRef = useRef(false);
  const totalQuestions = 10;
  const [isLoading, setIsLoading] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isInterviewCompleted, setInterviewCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const answerRequestRef = useRef<AbortController | null>(null);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [isFollowUpQuestion, setIsFollowUpQuestion] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');

  const loadingMessages = [
    "AI 면접관이 이력서를 뒤적이는 중...",
    "면접관이 커피를 마시는 중...",
    "다음 질문을 고민하는 중...",
    "당신의 답변을 깊이 생각하는 중...",
    "면접관이 메모를 하는 중...",
    "인상 깊은 답변에 감탄하는 중...",
    "면접관이 안경을 고쳐쓰는 중...",
    "면접관이 고개를 끄덕이는 중...",
    "당신의 포트폴리오를 살펴보는 중...",
    "면접관이 동료와 의견을 나누는 중...",
    "면접관이 필기한 내용을 정리하는 중...",
    "당신의 경력사항을 검토하는 중...",
    "면접관이 물 한 잔 마시는 중...",
    "다음 질문을 위해 자료를 찾는 중...",
    "면접관이 감명받은 표정을 짓는 중..."
  ];

  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isProcessing) {
      intervalId = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isProcessing]);

  useEffect(() => {
    if (listening) {
      const timer = setInterval(() => {
        setAnswerTime((prev) => prev + 1);
      }, 1000);
      setAnswerTimer(timer);
    } else {
      if (answerTimer) {
        clearInterval(answerTimer);
        setAnswerTimer(null);
      }
    }
    return () => {
      if (answerTimer) {
        clearInterval(answerTimer);
      }
    };
  }, [listening]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const initializeRecognition = () => {
    if (typeof window === 'undefined' || !('webkitSpeechRecognition' in window)) {
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.onstart = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current = null;
    }

    console.log('🎤 음성 인식 초기화...');
    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'ko-KR';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 음성 인식이 시작되었습니다.');
      isRecognitionStartedRef.current = true;
      setIsRecognitionActive(true);
      setFinalTranscript('');
      setInterimTranscript('');
    };

    recognition.onresult = (event) => {
      let interim = '';
      let final = finalTranscript;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += ' ' + transcript;
          console.log('🗣️ 음성 인식 최종 결과 추가:', transcript);
        } else {
          interim += transcript;
        }
      }

      if (final !== finalTranscript) {
        setFinalTranscript(final.trim());
      }
      setInterimTranscript(interim.trim());

      const fullTranscript = (final + ' ' + interim).trim().replace(/\s+/g, ' ');
      setTranscript(fullTranscript);

      console.log('🎙️ 음성 인식 현재 상태:', {
        final,
        interim,
        fullTranscript
      });
    };

    recognition.onend = () => {
      const currentState = {
        listening,
        isRecognitionStarted: isRecognitionStartedRef.current,
        finalTranscript,
        interimTranscript
      };
      
      console.log('🎤 음성 인식 세션 종료', currentState);
      
      isRecognitionStartedRef.current = false;
      setIsRecognitionActive(false);

      if (!listening) {
        if (interimTranscript) {
          const finalText = (finalTranscript + ' ' + interimTranscript).trim();
          setFinalTranscript(finalText);
          setTranscript(finalText);
          setInterimTranscript('');
        }
        console.log('🛑 의도적인 음성 인식 종료 - 최종 transcript:', transcript);
        return;
      }

      if (listening) {
        console.log('🔄 음성 인식 재시작 준비...');
        setTimeout(() => {
          if (listening && recognitionRef.current && !isRecognitionStartedRef.current) {
            try {
              recognitionRef.current.start();
              isRecognitionStartedRef.current = true;
              setIsRecognitionActive(true);
              console.log('✅ 음성 인식 재시작 성공');
            } catch (error) {
              console.error('❌ 음성 인식 재시작 실패:', error);
              setListening(false);
              setIsRecognitionActive(false);
            }
          }
        }, 300);
      }
    };

    recognition.onerror = (event) => {
      console.log('⚠️ 음성 인식 오류 발생:', event.error);
      
      switch (event.error) {
        case 'aborted':
          if (!listening) return;
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          setError('마이크 권한을 허용해주세요.');
          setListening(false);
          return;
        case 'network':
          setError('네트워크 연결을 확인해주세요.');
          setListening(false);
          return;
      }
    };

    recognitionRef.current = recognition;
  };

  useEffect(() => {
    initializeRecognition();
    return () => {
      if (recognitionRef.current) {
        if (isRecognitionStartedRef.current) {
          recognitionRef.current.stop();
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    console.log('[LOG] startListening 진입', { isRecognitionStarted: isRecognitionStartedRef.current, isRecognitionActive });
    if (!recognitionRef.current) {
      initializeRecognition();
    }
    if (recognitionRef.current && !isRecognitionStartedRef.current) {
      try {
        setListening(true);
        setAnswerTime(0);
        setError(null);
        recognitionRef.current.start();
        console.log('[LOG] 음성 인식 시작');
      } catch (error) {
        console.error('[ERROR] 음성 인식 시작 실패:', error);
        setListening(false);
        setError('음성 인식을 시작할 수 없습니다. 다시 시도해주세요.');
        isRecognitionStartedRef.current = false;
        setIsRecognitionActive(false);
      }
    } else {
      console.log('[LOG] 음성 인식이 이미 실행 중이거나 초기화되지 않음');
    }
  };

  const stopListening = () => {
    console.log('[LOG] stopListening 진입', { isRecognitionStarted: isRecognitionStartedRef.current, isRecognitionActive });
    if (recognitionRef.current && isRecognitionStartedRef.current) {
      try {
        setListening(false);
        recognitionRef.current.stop();
        console.log('[LOG] 음성 인식 중단');
      } catch (error) {
        console.error('[ERROR] 음성 인식 중단 실패:', error);
        isRecognitionStartedRef.current = false;
        setIsRecognitionActive(false);
      }
    }
  };

  const resetTranscript = () => {
    console.log('[LOG] resetTranscript 진입');
    setTranscript('');
    if (listening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setTimeout(() => {
          if (recognitionRef.current && listening) {
            try {
              recognitionRef.current.start();
              console.log('[LOG] 음성 인식 재시작');
            } catch (error) {
              console.error('[ERROR] 음성 인식 재시작 실패:', error);
              setListening(false);
              setIsRecognitionActive(false);
              isRecognitionStartedRef.current = false;
            }
          }
        }, 100);
      } catch (error) {
        console.error('[ERROR] 음성 인식 중단 실패:', error);
        setListening(false);
        setIsRecognitionActive(false);
        isRecognitionStartedRef.current = false;
      }
    }
  };

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

  const handleAnswer = async () => {
    console.log('[LOG] handleAnswer 진입', { 
      transcript, 
      threadId, 
      isSubmitting, 
      isProcessing,
      currentQuestion
    });
    
    if (!transcript || !threadId || isSubmitting || isProcessing) return;
    setIsSubmitting(true);
    setIsProcessing(true);
    
    // 마지막 질문 답변 제출 시 confetti 효과 실행
    if (progress === totalQuestions) {
      fireConfetti();
    }
    
    if (listening) {
      setListening(false);
      if (recognitionRef.current && isRecognitionStartedRef.current) {
        try {
          recognitionRef.current.stop();
          isRecognitionStartedRef.current = false;
        } catch (error) {
          console.error('[ERROR] 음성 인식 중단 실패:', error);
        }
      }
    }
    try {
      if (answerRequestRef.current) {
        answerRequestRef.current.abort();
        console.log('[LOG] 이전 요청 abort');
      }
      answerRequestRef.current = new AbortController();
      setError(null);
      const currentAnswer = {
        question: currentQuestion,
        answer: transcript
      };

      console.log('📤 API 요청 데이터:', {
        previousAnswers: [...answers, currentAnswer],
        currentAnswer,
        totalAnswersCount: answers.length + 1,
        companyId,
        jobId,
        threadId
      });

      setAnswers(prev => [...prev, currentAnswer]);
      setTranscript('');
      setCurrentAnswer('');
      setListening(false);
      setIsRecognitionActive(false);
      isRecognitionStartedRef.current = false;
      
      console.log('[LOG] 답변 제출 fetch 시작');
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          previousAnswers: [...answers, currentAnswer],
          companyId,
          jobId,
          threadId,
          resumeContent
        }),
        signal: answerRequestRef.current.signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[ERROR] 답변 제출 fetch 실패', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📥 API 응답 데이터:', data);

      if (data.message === 'Interview completed') {
        setIsInterviewing(false);
        setInterviewCompleted(true);
        setTimeout(() => {
          fireConfetti();
        }, 100);

        // 면접 완료 시 피드백 데이터를 상태로 저장하지 않고, 
        // 총평 페이지에서 불러올 수 있도록 sessionStorage에 저장
        try {
          console.log('📊 면접 데이터 저장', { 
            threadId, 
            answersCount: answers.length + 1 
          });
          
          // 면접 데이터를 sessionStorage에 저장
          const interviewData = {
            threadId,
            answers: [...answers, currentAnswer],
            timestamp: new Date().toISOString()
          };
          sessionStorage.setItem('interviewData', JSON.stringify(interviewData));
          console.log('✅ 면접 데이터 저장 완료');
        } catch (error) {
          console.error('❌ 면접 데이터 저장 실패:', error);
          setError('면접 데이터 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
        return;
      }
      if (data.isFollowUp) {
        setIsFollowUpQuestion(true);
        setCurrentQuestion(data.question);
        setTranscript('');
        setCurrentAnswer('');
        return;
      }
      setIsFollowUpQuestion(false);
      setCurrentQuestion(data.question);
      setTranscript('');
      setCurrentAnswer('');
      setProgress(prev => Math.min(prev + 1, totalQuestions));
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('[LOG] handleAnswer AbortError');
        return;
      }
      console.error('[ERROR] handleAnswer 예외', error);
      setError(error instanceof Error ? error.message : '답변 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      setAnswers(prev => prev.slice(0, -1));
    } finally {
      setIsProcessing(false);
      setIsSubmitting(false);
      answerRequestRef.current = null;
      setTranscript('');
      setCurrentAnswer('');
      setListening(false);
      setIsRecognitionActive(false);
      isRecognitionStartedRef.current = false;
      console.log('[LOG] handleAnswer 종료');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentAnswer.trim()) return;
    setIsLoading(true);
    console.log('[LOG] handleSubmit 진입', currentAnswer);
    try {
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId,
          jobId,
          previousAnswers: [...answers, { question: currentQuestion, answer: currentAnswer }],
          threadId,
        }),
      });
      console.log('[LOG] handleSubmit fetch 응답', response.status);
      if (!response.ok) {
        throw new Error('API 호출 실패');
      }
      const data = await response.json();
      console.log('[LOG] handleSubmit fetch 성공', data);
      if (data.message === 'Interview completed') {
        setInterviewCompleted(true);
        console.log('[LOG] 면접 완료');
      } else {
        setCurrentQuestion(data.question);
        setThreadId(data.threadId);
        setAnswers(prev => [...prev, { question: currentQuestion, answer: currentAnswer }]);
        setCurrentAnswer('');
        setProgress(prev => prev + 1);
      }
    } catch (error) {
      console.error('[ERROR] handleSubmit 예외', error);
      setError('질문을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
      console.log('[LOG] handleSubmit 종료');
    }
  };

  const startInterview = async () => {
    console.log('🎯 면접 시작 요청...', {
      companyId,
      jobId,
      resumeContent: resumeContent ? '있음' : '없음'
    });
    setIsInterviewing(true);
    setIsProcessing(true);
    setError(null);
    
    try {
      console.log('📤 첫 질문 요청 중...');
      const response = await fetch('/api/interview/question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          companyId: String(companyId),
          jobId: String(jobId),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 첫 질문 수신 완료:', {
        question: data.question,
        threadId: data.threadId
      });
      setCurrentQuestion(data.question);
      setThreadId(data.threadId);
    } catch (error) {
      console.error('❌ 면접 시작 오류:', error);
      setError('면접을 시작하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsInterviewing(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFeedbackDetails = (feedback: InterviewFeedback) => {
    return (
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
      </div>
    );
  };

  if (typeof window !== 'undefined' && !('webkitSpeechRecognition' in window)) {
    return <div className="text-center text-red-500">
      브라우저가 음성 인식을 지원하지 않습니다. Chrome을 사용해주세요.
    </div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        {isInterviewCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h1 className="text-3xl font-bold text-center mb-8">면접 완료</h1>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="bg-white rounded-lg p-4 mb-6">
                <p className="text-gray-600">면접이 종료되었습니다! 정말 수고하셨습니다.</p>
                <p className="text-gray-600 mt-2">아래 버튼을 클릭하시면 면접 총평을 확인하실 수 있습니다.</p>
              </div>
              {error ? (
                <div className="text-red-500 text-center p-4">
                  {error}
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    다시 시도
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center py-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push('/interview/feedback')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    면접 총평 확인하기
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-800">AI 면접</h1>
              <div className="text-sm text-gray-500">
                진행도: {progress}/{totalQuestions}
                {isFollowUpQuestion && <span className="ml-2 text-blue-500">(추가 질문)</span>}
              </div>
            </div>

            {/* 이전 질문-답변 카드 스택 */}
            <div className="space-y-4 mb-8">
              {answers.map((answer, index) => (
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

            {/* 현재 질문 카드 */}
            {isInterviewing && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`${transcript && !listening ? 'bg-gray-50' : 'bg-blue-50'} rounded-lg p-6 shadow-sm mb-8`}
              >
                <h2 className="text-xl font-bold text-gray-800 mb-4">현재 질문</h2>
                {isProcessing ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-lg text-gray-600">{loadingMessages[loadingMessageIndex]}</p>
                    <LoadingDots />
                  </div>
                ) : (
                  <p className="text-gray-700 mb-6">{currentQuestion}</p>
                )}
                
                <div className="bg-white rounded-lg p-4 mb-4">
                  <p className="text-gray-600">{transcript || '음성 인식 대기 중...'}</p>
                </div>

                <div className="flex justify-center space-x-4">
                  {!listening && (
                    <button
                      onClick={startListening}
                      disabled={isProcessing || isSubmitting}
                      className="flex items-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                    >
                      답변 시작
                    </button>
                  )}
                  {listening && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={stopListening}
                        disabled={isProcessing || isSubmitting}
                        className="flex items-center px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                      >
                        답변 종료
                      </button>
                      <span className="text-sm text-gray-600">
                        답변 시간: {formatTime(answerTime)}
                      </span>
                    </div>
                  )}
                  {transcript && !listening && (
                    <button
                      onClick={handleAnswer}
                      disabled={isProcessing || isSubmitting}
                      className="flex items-center px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                    >
                      {isProcessing || isSubmitting ? '처리 중...' : progress === totalQuestions ? '마지막 답변 제출' : '답변 제출'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* 시작 버튼 */}
            <div className="flex justify-center">
              {!isInterviewing && !isInterviewCompleted && (
                <button
                  onClick={startInterview}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? '면접 준비 중...' : '면접 시작하기'}
                </button>
              )}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 text-center text-red-500">
            {error}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InterviewRoom; 