'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Company {
  id: string;
  name: string;
  logo: string;
}

interface CompanySelectionProps {
  onCompanySelect: (companyId: string) => void;
  onNext: () => void;
}

const companies: Company[] = [
  { id: '1', name: '삼성전자', logo: '/logos/samsung.svg' },
  { id: '2', name: 'LG전자', logo: '/logos/lg.png' },
  { id: '3', name: 'SK하이닉스', logo: '/logos/sk.png' },
  // 추가 기업들...
];

const CompanySelection = ({ onCompanySelect, onNext }: CompanySelectionProps) => {
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  const handleCompanySelect = (companyId: string) => {
    console.log('🏢 선택된 기업 ID:', companyId);
    setSelectedCompany(companyId);
    onCompanySelect(companyId);
  };

  const handleNext = () => {
    console.log('➡️ 다음 단계로 이동 (기업 선택 완료):', {
      selectedCompany,
      companyName: companies.find(c => c.id === selectedCompany)?.name
    });
    onNext();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold mb-8">지원 기업 선택</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <motion.div
              key={company.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleCompanySelect(company.id)}
              className={`p-6 border rounded-lg cursor-pointer transition-colors ${
                selectedCompany === company.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <img
                src={company.logo}
                alt={company.name}
                className="w-20 h-20 mx-auto mb-4"
                onError={(e) => {
                  console.log('🖼️ 기업 로고 로드 실패:', company.name);
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'w-20 h-20 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-lg';
                  fallback.textContent = company.name.charAt(0);
                  target.parentNode?.insertBefore(fallback, target.nextSibling);
                }}
              />
              <h2 className="text-xl font-semibold text-center">{company.name}</h2>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={!selectedCompany}
            className={`px-6 py-3 rounded-lg font-semibold ${
              !selectedCompany
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            다음
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default CompanySelection; 