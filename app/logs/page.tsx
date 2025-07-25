'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Download, Calendar, FileText } from 'lucide-react';

type TabType = 'NAVER_LOW_REWARD' | 'NAVER_NORMAL' | 'NAVER_LOGIC_1';

const tabs = [
  { name: '리워드1', value: 'NAVER_LOW_REWARD' },
  { name: '리워드2', value: 'NAVER_NORMAL' },
  { name: '유입플', value: 'NAVER_LOGIC_1' },
];

const getDatePresets = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  
  const getMonthName = (monthIndex: number, year: number) => {
    const adjustedMonth = monthIndex < 0 ? 12 + monthIndex : monthIndex;
    const adjustedYear = monthIndex < 0 ? year - 1 : year;
    return `${adjustedYear}년 ${adjustedMonth + 1}월`;
  };

  return [
    { name: '오늘', value: 'today' },
    { name: '1일전', value: '1day' },
    { name: '이번달', value: 'thisMonth' },
    { name: getMonthName(currentMonth - 1, currentYear), value: 'minus1Month' },
    { name: getMonthName(currentMonth - 2, currentYear), value: 'minus2Month' },
    { name: getMonthName(currentMonth - 3, currentYear), value: 'minus3Month' },
  ];
};

const datePresets = getDatePresets();

export default function LogsManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const itemsPerPage = 10;

  const currentType = (searchParams.get('type') as TabType) || 'NAVER_LOW_REWARD';

  const handleTabChange = (type: TabType) => {
    router.push(`/logs?type=${type}`);
  };

  const handleDatePreset = (preset: string) => {
    const today = new Date();
    let start = new Date();
    let end = new Date();

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case '1day':
        start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        end = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = today;
        break;
      case 'minus1Month':
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'minus2Month':
        start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        end = new Date(today.getFullYear(), today.getMonth() - 1, 0);
        break;
      case 'minus3Month':
        start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
        end = new Date(today.getFullYear(), today.getMonth() - 2, 0);
        break;
    }

    setStartDate(start.toISOString().slice(0, 10));
    setEndDate(end.toISOString().slice(0, 10));
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedLogs([]);
    setSearchTerm('');
  }, [currentType]);

  // 조회 기간 요약 데이터
  const periodSummary = {
    period: `${startDate} ~ ${endDate}`,
    totalQuantity: 1250,
    totalOrderDays: 45,
  };

  // 각 탭별 로그 데이터
  const getLogData = (type: TabType) => {
    const baseNames = {
      NAVER_LOW_REWARD: '리워드1',
      NAVER_NORMAL: '리워드2',
      NAVER_LOGIC_1: '유입플',
    };
    
    const counts = {
      NAVER_LOW_REWARD: 40,
      NAVER_NORMAL: 30,
      NAVER_LOGIC_1: 50,
    };

    return Array.from({ length: counts[type] }, (_, i) => ({
      id: i + 1,
      category: i % 3 === 0 ? '연장' : i % 3 === 1 ? '생성' : '환불',
      general: `user${i + 1}`,
      quantity: Math.floor(Math.random() * 50) + 1,
      period: `${Math.floor(Math.random() * 30) + 1}일`,
      totalDays: Math.floor(Math.random() * 30) + 1,
      createdAt: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toLocaleString('ko-KR'),
      startDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toLocaleDateString('ko-KR'),
      deleteLog: i % 5 === 0 ? true : false,
      type: type,
    }));
  };

  const logs = getLogData(currentType);

  // 검색 필터링
  const filteredLogs = logs.filter(log =>
    log.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.general.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이징 처리
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLogs(paginatedLogs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const handleSelectLog = (id: number) => {
    setSelectedLogs(prev =>
      prev.includes(id) ? prev.filter(logId => logId !== id) : [...prev, id]
    );
  };

  const handleExcelDownload = () => {
    alert('엑셀 파일 다운로드 기능');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">정산관리</h1>
      <h3 className="text-lg text-gray-900 mb-6">슬롯의 발주 및 환불 로그를 확인할 수 있습니다.</h3>
      <div className="border-b border-gray-300 mb-4"></div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value as TabType)}
              className={`px-2 py-3 text-sm font-medium transition-all duration-300 ease-in-out border-b-2 ${
                currentType === tab.value
                  ? 'text-indigo-600 border-indigo-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
        <div className="border-b border-gray-300"></div>
      </div>

      {/* 날짜 선택 영역 */}
      <div className="mb-6 bg-white rounded-lg shadow p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <span className="text-gray-500">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {datePresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleDatePreset(preset.value)}
                className="px-3 py-2 text-xs font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>

        {/* 기간 요약 */}
        <div className="grid grid-cols-3 gap-6 text-center border-t pt-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">조회 기간</p>
            <p className="text-lg font-semibold text-gray-900">{periodSummary.period}</p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-600 mb-2">수량 합계</p>
            <p className="text-lg font-semibold text-blue-600">{periodSummary.totalQuantity}</p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-600 mb-2">발주일수 합계</p>
            <p className="text-lg font-semibold text-green-600">{periodSummary.totalOrderDays}일</p>
          </div>
        </div>
      </div>

      {/* 검색 및 버튼 영역 */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-auto">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="검색어를 입력하세요"
            className="block w-full sm:w-80 pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExcelDownload}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Download className="h-4 w-4 mr-2" />
            엑셀 저장
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg transition-all duration-300 ease-in-out opacity-100 transform translate-x-0">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                구분
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                사용자 ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수량
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                기간
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                일수합계
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                생성일시
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업시작일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                삭제로그
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    log.category === '연장' 
                      ? 'bg-blue-100 text-blue-800' 
                      : log.category === '생성'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {log.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.general}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.period}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.totalDays}일
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.createdAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.startDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {log.deleteLog && (
                    <button
                      onClick={() => alert('삭제 로그 확인')}
                      className="text-gray-600 hover:text-gray-900"
                      title="삭제 로그 보기"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
      <div className="mt-6 flex items-center justify-between">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">이전</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              const isNearCurrent = Math.abs(pageNumber - currentPage) <= 2;
              const isFirst = pageNumber === 1;
              const isLast = pageNumber === totalPages;
              
              if (isNearCurrent || isFirst || isLast) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                (pageNumber === 2 && currentPage > 4) ||
                (pageNumber === totalPages - 1 && currentPage < totalPages - 3)
              ) {
                return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
              }
              return null;
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">다음</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}