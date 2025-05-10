'use client';

import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
import React from 'react';

// 대표 색상
const PRIMARY = '#008B91';
const SUB1 = '#007177';
const SUB2 = '#005A5E';

// 히어로 섹션
function HeroSection() {
  return (
    <section className="flex flex-col md:flex-row items-center justify-center min-h-[70vh] gap-8 px-4 pt-24 pb-8 md:pb-16">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 text-center md:text-left"
      >
        <h1 className="text-5xl font-extrabold mb-4 leading-tight" style={{ color: PRIMARY }}>
          AI 면접관과 <br className="hidden md:block" />실전처럼 연습하세요
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          카이로스는 AI가 실전 면접을 시뮬레이션하고, <br className="hidden md:block" />즉각적인 피드백을 제공합니다.
        </p>
        <Link href="/login">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{ background: PRIMARY, color: 'white' }}
            className="py-4 px-8 rounded-full font-semibold text-lg shadow-md"
          >
            카카오로 시작하기
          </motion.button>
        </Link>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.3 }}
        className="flex-1 flex justify-center"
      >
        <Image src="/kairos-otter.png" alt="Kairos 수달 캐릭터" width={260} height={260} className="rounded-full shadow-lg bg-gray-100" />
      </motion.div>
    </section>
  );
}

// AI 모의면접 데모 섹션 (채팅 UI, 5턴 대화, 스크롤 시 순차 등장)
function DemoSection() {
  const controls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 });
  if (inView) controls.start({ opacity: 1, y: 0, scale: 1 });

  // 각 메시지의 애니메이션 컨트롤
  const [showAI1, setShowAI1] = useState(false);
  const [showUser1, setShowUser1] = useState(false);
  const [showAI2, setShowAI2] = useState(false);
  const [showUser2, setShowUser2] = useState(false);
  const [showAI3, setShowAI3] = useState(false);

  // 스크롤 진입 시 순차적으로 메시지 등장
  React.useEffect(() => {
    if (inView) {
      setTimeout(() => setShowAI1(true), 200);
      setTimeout(() => setShowUser1(true), 900);
      setTimeout(() => setShowAI2(true), 1700);
      setTimeout(() => setShowUser2(true), 2500);
      setTimeout(() => setShowAI3(true), 3400);
    }
  }, [inView]);

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 80, scale: 0.96 }}
      animate={controls}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-2xl mx-auto my-10 md:my-32 bg-white rounded-2xl shadow-xl p-0 md:p-0 flex flex-col items-center px-4 py-8"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.10)' }}
    >
      <div className="w-full px-0 md:px-12 py-4 md:py-10">
        <h2 className="text-3xl font-extrabold mb-8 text-center md:text-left" style={{ color: PRIMARY }}>AI 모의면접 체험</h2>
        <div className="flex flex-col gap-6">
          {/* AI 질문 1 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={showAI1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-start gap-3"
          >
            <Image src="/kairos-otter.png" alt="AI" width={44} height={44} className="rounded-full border border-gray-200 bg-white" />
            <div>
              <div className="font-semibold" style={{ color: PRIMARY }}>KAIO - AI 면접관</div>
              <div className="bg-gray-100 rounded-2xl px-5 py-3 mt-1 text-base text-gray-800 shadow-sm max-w-[320px] md:max-w-[400px]">
                자기소개를 1분 이내로 해주세요.
              </div>
            </div>
          </motion.div>
          {/* 유저 답변 1 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={showUser1 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-start gap-3 self-end"
          >
            <div>
              <div className="font-semibold" style={{ color: SUB2, textAlign: 'right' }}>나</div>
              <div className="bg-[#E6F6F7] rounded-2xl px-5 py-3 mt-1 text-base text-gray-800 shadow-sm max-w-[320px] md:max-w-[400px] text-right">
                안녕하세요, 저는 신입 백엔드 개발자 지원자 홍길동입니다. 대학에서 컴퓨터공학을 전공했고, 다양한 프로젝트 경험이 있습니다.
              </div>
            </div>
            <Image src="/kairos-otter.png" alt="User" width={44} height={44} className="rounded-full border border-gray-200 bg-white opacity-0" />
          </motion.div>
          {/* AI 질문 2 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={showAI2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-start gap-3"
          >
            <Image src="/kairos-otter.png" alt="AI" width={44} height={44} className="rounded-full border border-gray-200 bg-white" />
            <div>
              <div className="font-semibold" style={{ color: PRIMARY }}>KAIO - AI 면접관</div>
              <div className="bg-gray-100 rounded-2xl px-5 py-3 mt-1 text-base text-gray-800 shadow-sm max-w-[320px] md:max-w-[400px]">
                본인의 강점과 약점을 각각 한 가지씩 말씀해 주세요.
              </div>
            </div>
          </motion.div>
          {/* 유저 답변 2 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={showUser2 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-start gap-3 self-end"
          >
            <div>
              <div className="font-semibold" style={{ color: SUB2, textAlign: 'right' }}>나</div>
              <div className="bg-[#E6F6F7] rounded-2xl px-5 py-3 mt-1 text-base text-gray-800 shadow-sm max-w-[320px] md:max-w-[400px] text-right">
                저의 강점은 문제 해결력입니다. 프로젝트 중 발생한 이슈를 빠르게 파악하고 해결한 경험이 많습니다. 약점은 발표에 대한 긴장감이 크다는 점인데, 이를 극복하기 위해 꾸준히 연습하고 있습니다.
              </div>
            </div>
            <Image src="/kairos-otter.png" alt="User" width={44} height={44} className="rounded-full border border-gray-200 bg-white opacity-0" />
          </motion.div>
          {/* AI 피드백 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={showAI3 ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex items-start gap-3"
          >
            <Image src="/kairos-otter.png" alt="AI" width={44} height={44} className="rounded-full border border-gray-200 bg-white" />
            <div>
              <div className="font-semibold" style={{ color: PRIMARY }}>KAIO - AI 면접관</div>
              <div className="bg-gray-100 rounded-2xl px-5 py-3 mt-1 text-base text-gray-800 shadow-sm max-w-[320px] md:max-w-[400px]">
                명확한 자기소개와 강점/약점 설명 감사합니다! 실제 경험을 구체적으로 예시로 들면 더 설득력 있는 답변이 될 수 있습니다. 발표에 대한 긴장감은 모의 발표를 통해 점차 극복할 수 있으니 꾸준히 연습해 보세요.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// 서비스 핵심 기능 카드뉴스 (대표색상 적용)
function FeatureCards() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <section ref={ref} className="w-full max-w-5xl mx-auto mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-4 py-6 md:py-10">
      {[
        {
          title: 'AI 기반 맞춤형 면접',
          desc: 'AI가 지원 직무에 맞는 질문을 자동 생성하고, 실제 면접과 유사한 환경을 제공합니다.',
          icon: '🤖',
        },
        {
          title: '실시간 피드백 & 총평',
          desc: '답변 후 즉시 AI 피드백을 제공하며, 강점과 보완점, 추천 학습 자료를 안내합니다.',
          icon: '📊',
        },
        {
          title: '간편한 카카오 로그인',
          desc: '카카오 계정으로 1초 만에 시작, 개인정보 안전하게 보호!',
          icon: '💛',
        },
        {
          title: '다양한 직무/기업 선택',
          desc: '원하는 기업/직무별 맞춤 면접 시나리오, 최신 채용 트렌드 반영.',
          icon: '🏢',
        },
        {
          title: '파일 업로드 & 분석',
          desc: '자기소개서, 이력서 업로드 시 AI 분석 및 문서 기반 맞춤 질문 제공.',
          icon: '📄',
        },
        {
          title: '언제 어디서나, 모바일 완벽 지원',
          desc: 'PC/모바일 모두 최적화된 UI, 시간과 장소의 제약 없이 연습 가능.',
          icon: '📱',
        },
      ].map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="bg-white rounded-2xl shadow-md p-8 flex flex-col items-center transition-transform cursor-pointer hover:shadow-xl min-h-[260px]"
        >
          <div className="text-4xl mb-4" style={{ color: SUB2 }}>{card.icon}</div>
          <h3 className="text-xl font-bold mb-2 text-center" style={{ color: SUB1 }}>{card.title}</h3>
          <p className="text-gray-500 text-center text-base">{card.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}

// AI 면접 프로세스 인포그래픽 (대표색상 적용)
function ProcessSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const steps = [
    { title: '카카오 로그인', icon: '💛' },
    { title: '직무/기업 선택', icon: '🏢' },
    { title: 'AI 면접 진행', icon: '🤖' },
    { title: '즉각 피드백', icon: '📊' },
  ];
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="max-w-3xl mx-auto my-10 md:my-20 px-4 py-6 md:py-10"
    >
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PRIMARY }}>AI 면접 프로세스</h2>
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="flex flex-col items-center"
          >
            <div className="text-4xl mb-2" style={{ color: SUB1 }}>{step.icon}</div>
            <div className="font-semibold text-lg mb-1" style={{ color: SUB1 }}>{step.title}</div>
            {i < steps.length - 1 && (
              <div className="hidden md:block h-12 border-r-2 border-dashed" style={{ borderColor: SUB2 }} />
            )}
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// FAQ 섹션 (대표색상 적용)
function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const faqs = [
    {
      q: 'AI 면접은 실제 면접과 어떻게 다른가요?',
      a: 'AI 면접은 실제 면접과 유사한 환경을 제공하지만, AI가 질문을 생성하고 피드백을 제공합니다. 반복 연습이 가능하며, 시간과 장소의 제약이 없습니다.',
    },
    {
      q: '모바일에서도 이용할 수 있나요?',
      a: '네, 카이로스는 PC와 모바일 모두 완벽하게 지원합니다.',
    },
    {
      q: '개인정보는 안전하게 보호되나요?',
      a: '카카오 로그인 기반으로 개인정보를 안전하게 보호하며, 면접 데이터는 암호화되어 저장됩니다.',
    },
    {
      q: '이용 요금이 있나요?',
      a: '기본 서비스는 무료로 제공되며, 일부 프리미엄 기능은 유료로 제공될 수 있습니다.',
    },
  ];
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7 }}
      className="max-w-2xl mx-auto my-10 md:my-20 px-4 py-6 md:py-10"
    >
      <h2 className="text-2xl font-bold mb-8 text-center" style={{ color: PRIMARY }}>자주 묻는 질문</h2>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="border rounded-lg overflow-hidden">
            <button
              className="w-full text-left px-6 py-4 bg-gray-100 font-semibold focus:outline-none flex justify-between items-center"
              style={{ color: SUB1 }}
              onClick={() => setOpen(open === i ? null : i)}
            >
              <span>{faq.q}</span>
              <span>{open === i ? '▲' : '▼'}</span>
            </button>
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={open === i ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="px-6 py-4 bg-white text-base"
              style={{ display: open === i ? 'block' : 'none', color: SUB2 }}
            >
              {faq.a}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.section>
  );
}

// 푸터 (대표색상 적용)
function Footer() {
  return (
    <footer className="py-8 px-4 mt-8" style={{ background: PRIMARY, color: 'white' }}>
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-6 px-2 md:px-0">
        <div>
          <h2 className="text-2xl font-bold mb-2">Kairos</h2>
          <p className="text-white/80 text-sm mb-2">AI 면접관과 함께하는 실전 면접 연습 서비스</p>
          <p className="text-white/60 text-xs">© {new Date().getFullYear()} Kairos. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <DemoSection />
      <FeatureCards />
      <ProcessSection />
      <FAQSection />
      <Footer />
    </main>
  );
} 