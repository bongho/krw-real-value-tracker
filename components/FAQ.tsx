'use client'

import { useState } from 'react'

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: '왜 M1이 아니라 M2를 사용하나요?',
      answer: 'M2는 저축성예금과 단기금융상품을 포함하여 경제 내 실질적인 통화 공급량을 더 정확히 반영합니다. M1은 단기 변동성이 커서 장기 추세 분석에 부적합합니다.',
    },
    {
      question: '기준 시점을 2010년으로 선정한 이유는?',
      answer: '2008 금융위기 이후 시장이 안정화된 시점이며, 한국은행과 FRED 모두 신뢰할 수 있는 데이터를 제공합니다. 15년 이상의 충분한 역사적 데이터를 확보할 수 있습니다.',
    },
    {
      question: '괴리율이 높으면 무조건 원화를 사야 하나요?',
      answer: '아닙니다. 괴리율은 참고 지표일 뿐이며, 정치적 리스크, 금리 차이, 무역 수지 등 다른 요인도 고려해야 합니다. 이 도구는 투자 결정의 보조 수단이지 절대적인 신호가 아닙니다.',
    },
    {
      question: '실시간 데이터를 제공하지 않는 이유는?',
      answer: 'M2 데이터는 월별로만 발표되므로 실시간 환율을 반영해도 적정 환율 계산에는 의미가 없습니다. 일 1회 업데이트로 충분합니다.',
    },
    {
      question: '왜 1개월, 3개월 같은 단기 조회 옵션이 없나요?',
      answer: null, // 특별 처리: 테이블 포함
    },
    {
      question: '왜 Vercel을 선택했나요?',
      answer: 'Vercel은 Next.js에 최적화되어 있으며, 무료 티어에서도 충분한 성능과 CDN을 제공합니다. 모바일 웹앱에 필요한 빠른 로딩 속도를 보장합니다.',
    },
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          💡 자주 묻는 질문 (FAQ)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          원화 실질 가치 트래커에 대해 자주 묻는 질문들입니다
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 overflow-hidden"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-100 pr-4">
                Q{index + 1}. {faq.question}
              </span>
              <span className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                {openIndex === index ? '▲' : '▼'}
              </span>
            </button>

            {openIndex === index && (
              <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-300 animate-fadeIn">
                {index === 4 ? (
                  // Q5 특별 처리: 데이터 업데이트 주기 테이블 포함
                  <div className="space-y-4">
                    <p>
                      M2 통화량 데이터는 <strong>월별로만 발표</strong>되기 때문에, 일별 또는 주별 단위로 의미 있는 분석이 불가능합니다.
                    </p>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        📊 데이터별 업데이트 주기
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-xs border border-gray-300 dark:border-slate-600">
                          <thead className="bg-gray-100 dark:bg-slate-600">
                            <tr>
                              <th className="px-3 py-2 text-left border-b border-gray-300 dark:border-slate-500 font-semibold text-gray-800 dark:text-gray-100">
                                데이터
                              </th>
                              <th className="px-3 py-2 text-left border-b border-gray-300 dark:border-slate-500 font-semibold text-gray-800 dark:text-gray-100">
                                업데이트 주기
                              </th>
                              <th className="px-3 py-2 text-left border-b border-gray-300 dark:border-slate-500 font-semibold text-gray-800 dark:text-gray-100">
                                출처
                              </th>
                              <th className="px-3 py-2 text-left border-b border-gray-300 dark:border-slate-500 font-semibold text-gray-800 dark:text-gray-100">
                                비고
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-gray-700 dark:text-gray-300">
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">한국 M2</td>
                              <td className="px-3 py-2">월 1회 (익월 중순)</td>
                              <td className="px-3 py-2">ECOS (한국은행)</td>
                              <td className="px-3 py-2">전월 데이터</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">미국 M2</td>
                              <td className="px-3 py-2">월 1회 (익월 초)</td>
                              <td className="px-3 py-2">FRED (세인트루이스 연은)</td>
                              <td className="px-3 py-2">전월 데이터</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">시장 환율</td>
                              <td className="px-3 py-2">일 1회</td>
                              <td className="px-3 py-2">ExchangeRate-API</td>
                              <td className="px-3 py-2">실시간 가능하나 M2 월별 특성상 의미 없음</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">금리 (한국/미국)</td>
                              <td className="px-3 py-2">월 1회</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">정책 금리는 월 1-2회 변경</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">VIX</td>
                              <td className="px-3 py-2">일 1회</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">시장 거래일 기준</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">DXY</td>
                              <td className="px-3 py-2">일 1회</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">시장 거래일 기준</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">경상수지</td>
                              <td className="px-3 py-2">분기 1회</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">분기 종료 후 1-2개월 뒤 발표</td>
                            </tr>
                            <tr className="border-b border-gray-200 dark:border-slate-600">
                              <td className="px-3 py-2 font-medium">GDP</td>
                              <td className="px-3 py-2">분기 1회</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">분기 종료 후 1-2개월 뒤 발표</td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 font-medium">CPI</td>
                              <td className="px-3 py-2">월 1회 (익월 초)</td>
                              <td className="px-3 py-2">FRED</td>
                              <td className="px-3 py-2">전월 데이터</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        왜 1년 미만 조회가 의미 없는가?
                      </h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>M2 괴리율은 <strong>통화량 증가율의 장기 추세</strong>를 기반으로 계산됩니다.</li>
                        <li>월별 데이터 특성상 <strong>최소 12개 데이터 포인트</strong> (1년)가 있어야 추세를 파악할 수 있습니다.</li>
                        <li>1-3개월 같은 초단기 변동은 <strong>노이즈에 가까우며</strong> 투자 의사결정에 오히려 해롭습니다.</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        📅 권장 조회 기간
                      </h4>
                      <ul className="space-y-1 list-disc list-inside">
                        <li><strong>최소</strong>: 1년 (12개 데이터 포인트)</li>
                        <li><strong>권장</strong>: 3년 (경기 사이클 1회분)</li>
                        <li><strong>장기 분석</strong>: 5년 또는 전체 (2010년~)</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p>{faq.answer}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
