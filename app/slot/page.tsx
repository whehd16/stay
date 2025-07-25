'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Edit, Trash2, Clock } from 'lucide-react';

type TabType = 'NAVER_LOW_REWARD' | 'NAVER_NORMAL' | 'NAVER_LOGIC_1' | 'LOGIC_1';

const tabs = [
  { name: '리워드1', value: 'NAVER_LOW_REWARD' },
  { name: '리워드2', value: 'NAVER_NORMAL' },
  { name: '유입플', value: 'NAVER_LOGIC_1' },
  { name: '쿠팡', value: 'LOGIC_1' },
];

export default function SlotManagementPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const itemsPerPage = 10;

  const currentType = (searchParams.get('type') as TabType) || 'NAVER_LOW_REWARD';

  const handleTabChange = (type: TabType) => {
    router.push(`/slot?type=${type}`);
  };

  useEffect(() => {
    setCurrentPage(1);
    setSelectedSlots([]);
    setSearchTerm('');
  }, [currentType]);

  // 각 탭별 상태별 개수 데이터
  const getStatusCounts = (type: TabType) => {
    const data = {
      NAVER_LOW_REWARD: { total: 156, normal: 120, waiting: 25, closing: 11 },
      NAVER_NORMAL: { total: 89, normal: 72, waiting: 12, closing: 5 },
      NAVER_LOGIC_1: { total: 203, normal: 180, waiting: 18, closing: 5 },
      LOGIC_1: { total: 45, normal: 38, waiting: 5, closing: 2 },
    };
    return data[type];
  };

  const statusCounts = getStatusCounts(currentType);

  // 각 탭별 슬롯 데이터
  const getSlotData = (type: TabType) => {
    const baseNames = {
      NAVER_LOW_REWARD: '네이버 리워드1',
      NAVER_NORMAL: '네이버 리워드2', 
      NAVER_LOGIC_1: '유입플',
      LOGIC_1: '쿠팡',
    };
    
    const counts = {
      NAVER_LOW_REWARD: 50,
      NAVER_NORMAL: 35,
      NAVER_LOGIC_1: 65,
      LOGIC_1: 25,
    };

    return Array.from({ length: counts[type] }, (_, i) => ({
      id: i + 1,
      userId: `user${i + 1}`,
      status: i % 4 === 0 ? '정상' : i % 4 === 1 ? '대기' : i % 4 === 2 ? '마감예정' : '정상',
      keyword: `키워드${i + 1}`,
      priceComparison: i % 2 === 0 ? 'Y' : 'N',
      plus: i % 3 === 0 ? 'Y' : 'N',
      productName: `${baseNames[type]} 상품 ${i + 1}`,
      productMID: `MID${1000 + i}`,
      priceComparisonMID: `PMID${2000 + i}`,
      workDays: Math.floor(Math.random() * 30) + 1,
      startDate: new Date(2024, 0, Math.floor(Math.random() * 30) + 1).toLocaleDateString('ko-KR'),
      endDate: new Date(2024, 1, Math.floor(Math.random() * 28) + 1).toLocaleDateString('ko-KR'),
      type: type,
    }));
  };

  const slots = getSlotData(currentType);

  // 검색 필터링
  const filteredSlots = slots.filter(slot =>
    slot.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slot.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 페이징 처리
  const totalPages = Math.ceil(filteredSlots.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSlots = filteredSlots.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedSlots(paginatedSlots.map(slot => slot.id));
    } else {
      setSelectedSlots([]);
    }
  };

  const handleSelectSlot = (id: number) => {
    setSelectedSlots(prev =>
      prev.includes(id) ? prev.filter(slotId => slotId !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">광고관리</h1>
      <h3 className="text-lg text-gray-900 mb-6">광고를 수정하고 관리할 수 있습니다.</h3>
      <div className="border-b border-gray-300 mb-4"></div>

      {/* 탭 네비게이션 */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value as TabType)}
              className={`px-2 py-3 text-sm font-medium transition-colors border-b-2 ${
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

      {/* 상태 요약 박스 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-sm text-gray-600 mb-2">전체</p>
            <p className="text-2xl font-bold text-gray-900">{statusCounts.total}</p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-600 mb-2">정상</p>
            <p className="text-2xl font-bold text-green-600">{statusCounts.normal}</p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-600 mb-2">대기</p>
            <p className="text-2xl font-bold text-yellow-600">{statusCounts.waiting}</p>
          </div>
          <div className="border-l border-gray-200 pl-6">
            <p className="text-sm text-gray-600 mb-2">마감예정</p>
            <p className="text-2xl font-bold text-red-600">{statusCounts.closing}</p>
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
            onClick={() => alert('수정 기능')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Edit className="h-4 w-4 mr-2" />
            수정
          </button>
          <button
            onClick={() => {
              if (selectedSlots.length > 0) {
                if (confirm(`${selectedSlots.length}개의 슬롯을 삭제하시겠습니까?`)) {
                  setSelectedSlots([]);
                }
              } else {
                alert('삭제할 슬롯을 선택해주세요.');
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            삭제
          </button>
          <button
            onClick={() => alert('연장 기능')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clock className="h-4 w-4 mr-2" />
            연장
          </button>
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedSlots.length === paginatedSlots.length && paginatedSlots.length > 0}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                번호
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                아이디
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                키워드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격비교
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                플러스
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상품MID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                가격비교MID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업일수
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업시작일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업종료일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedSlots.map((slot) => (
              <tr key={slot.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedSlots.includes(slot.id)}
                    onChange={() => handleSelectSlot(slot.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.userId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    slot.status === '정상' 
                      ? 'bg-green-100 text-green-800' 
                      : slot.status === '대기'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {slot.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.keyword}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    slot.priceComparison === 'Y' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {slot.priceComparison}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    slot.plus === 'Y' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {slot.plus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.productName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {slot.productMID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {slot.priceComparisonMID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {slot.workDays}일
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {slot.startDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {slot.endDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => alert(`${slot.userId} 수정`)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
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