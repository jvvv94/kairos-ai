"use client";

import { useEffect, useState } from "react";

const EMOJI_LIST = [
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Astronaut%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Construction%20Worker%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Firefighter%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Man%20Health%20Worker%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Pilot%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Technologist%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Factory%20Worker%20Light%20Skin%20Tone.png",
  "https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/People%20with%20professions/Woman%20Teacher%20Light%20Skin%20Tone.png"
];

const TIPS = [
  "면접은 긴장하지 말고 자연스럽게 임하세요.",
  "질문을 잘 듣고, 천천히 생각한 뒤 답변해도 괜찮아요.",
  "실제 경험과 프로젝트를 구체적으로 설명하면 좋아요.",
  "지원 동기와 직무에 대한 열정을 보여주세요.",
  "모르는 질문이 나와도 당황하지 말고 솔직하게 답변하세요."
];

export default function InterviewReadyScreen({ resumeContent, onEnter }) {
  const [emojiIdx, setEmojiIdx] = useState(0);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));
  const [isReady, setIsReady] = useState(false);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    // 이모지 5초마다 변경 + fade 애니메이션
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setEmojiIdx((prev) => (prev + 1) % EMOJI_LIST.length);
        setFade(true);
      }, 400); // fade out 후 이미지 변경
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // PDF 요약 API 호출
    const summarize = async () => {
      if (!resumeContent) {
        setIsReady(true);
        return;
      }
      try {
        await fetch('/api/interview/summarize-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: resumeContent }),
        });
        setIsReady(true);
      } catch {
        setIsReady(true); // 실패해도 입장 가능
      }
    };
    summarize();
  }, [resumeContent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">AI 면접 준비 중...</h2>
        <p className="text-gray-700 mb-6">{TIPS[tipIdx]}</p>
        <img
          src={EMOJI_LIST[emojiIdx]}
          alt="면접 준비 이모지"
          width={150}
          height={150}
          className={`mx-auto mb-2 transition-all duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
        />
        <p className="text-gray-400 text-sm mb-6">AI가 이력서를 분석하고 면접을 준비하고 있습니다...</p>
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
            isReady
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          disabled={!isReady}
          onClick={onEnter}
        >
          면접장 입장하기
        </button>
      </div>
    </div>
  );
} 