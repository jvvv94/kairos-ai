'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { FaRegFilePdf } from 'react-icons/fa';

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
}

const FileUpload = ({ onFileUpload }: FileUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/pdf') {
        setIsProcessing(true);
        setUploadedFile(file);
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch('/api/interview/resume', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            throw new Error('PDF 처리 중 오류가 발생했습니다.');
          }

          const data = await response.json();
          onFileUpload(file, data.content);
        } catch (error) {
          console.error('Error processing PDF:', error);
          alert('PDF 처리 중 오류가 발생했습니다.');
        } finally {
          setIsProcessing(false);
        }
      } else {
        alert('PDF 파일만 업로드 가능합니다.');
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">이력서 또는 포트폴리오를<br />업로드해주세요</h1>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isProcessing ? 'border-gray-300 bg-gray-50' : isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}`}
        >
          <input {...getInputProps()} />
          {isProcessing ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg text-gray-600">PDF 파일을 처리 중입니다...</p>
            </div>
          ) : uploadedFile ? (
            <div className="flex flex-col items-center justify-center">
              <FaRegFilePdf className="text-5xl text-red-500 mb-2" />
              <span className="text-base text-gray-800 font-medium">{uploadedFile.name}</span>
            </div>
          ) : (
            <>
              <p className="text-lg text-gray-600">
                {isDragActive
                  ? '파일을 여기에 놓아주세요'
                  : 'PDF 파일을 드래그하여 놓거나 클릭하여 선택해주세요'}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                (최대 1개의 PDF 파일)
              </p>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FileUpload; 