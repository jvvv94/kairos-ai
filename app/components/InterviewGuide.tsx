'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface InterviewGuideProps {
  onFileUpload: (file: File) => void;
  onNext: () => void;
}

const InterviewGuide = ({ onFileUpload, onNext }: InterviewGuideProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileUpload(selectedFile);
    }
  }, [onFileUpload]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">AI 면접 안내</h1>
        
        <div className="space-y-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">면접 진행 방식</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>총 10개의 질문이 순차적으로 진행됩니다</li>
              <li>음성으로 답변하시면 자동으로 텍스트로 변환됩니다</li>
              <li>답변 시간은 질문마다 최대 3분입니다</li>
              <li>답변 후 제출하기 버튼을 눌러 다음 질문으로 넘어갑니다</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">이력서/포트폴리오 업로드 (선택)</h2>
            <div className="flex items-center gap-4">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
              />
              {file && (
                <span className="text-sm text-gray-600">
                  {file.name}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            면접 시작하기
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default InterviewGuide; 