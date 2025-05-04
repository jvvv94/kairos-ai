'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { IoMenu } from 'react-icons/io5';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 bg-white z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <h1 className="text-2xl font-bold">AI INTERVIEW</h1>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            <IoMenu size={24} />
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-16">
        {/* 타이틀 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-4xl font-bold mb-4">
            AI Interviewer
          </h2>
        </motion.div>

        {/* 서브 타이틀 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-12"
        >
          <p className="text-2xl font-medium">
            AI로 면접을 준비해보세요!
          </p>
        </motion.div>

        {/* 버튼 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-md"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-[#FFE500] text-black py-4 rounded-full font-semibold text-lg mb-4"
            >
              카카오로 시작하기
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* 메뉴 오버레이 */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: '100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '100%' }}
          className="fixed top-0 right-0 w-64 h-full bg-white shadow-lg z-50 p-6"
        >
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="self-end"
            >
              ✕
            </button>
            <Link href="/about" className="text-lg font-medium">
              서비스 소개
            </Link>
            <Link href="/pricing" className="text-lg font-medium">
              요금제
            </Link>
            <Link href="/contact" className="text-lg font-medium">
              문의하기
            </Link>
          </div>
        </motion.div>
      )}
    </main>
  );
} 