import { KRWChart } from '@/components/KRWChart'
import { InvestmentSuggestion } from '@/components/InvestmentSuggestion'
import KeyIndicators from '@/components/KeyIndicators'
import type { KRWDataset } from '@/lib/calculations'
import { promises as fs } from 'fs'
import path from 'path'

async function getData(): Promise<KRWDataset> {
  // 서버 컴포넌트에서 직접 파일 시스템 읽기
  // 프로덕션/개발 환경 모두에서 작동
  const filePath = path.join(process.cwd(), 'public', 'data', 'krw-data.json')
  const fileContents = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileContents)
}

export default async function Home() {
  let dataset: KRWDataset | null = null
  let error: string | null = null

  try {
    dataset = await getData()
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">
            원화 실질 가치 트래커
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            M2 통화량 기반 환율 평가 대시보드
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            시장 환율과 M2 기준 적정 환율의 괴리를 시각화합니다
          </p>
        </header>

        {/* 데이터 메타정보 (v2.5.1) */}
        {dataset && (() => {
          const lastUpdate = new Date(dataset.metadata.lastUpdated)
          const now = new Date()
          const hoursSinceUpdate = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60))
          const isRecent = hoursSinceUpdate < 24

          return (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-lg border border-blue-200 dark:border-slate-600 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📅</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">최종 업데이트</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {lastUpdate.toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {hoursSinceUpdate === 0 ? '방금 전' : `${hoursSinceUpdate}시간 전`}
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">업데이트 주기</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        일 1회 (매일 자정)
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        다음: 내일 00:00
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📍</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">기준 시점</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {new Date(dataset.metadata.baseDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        기준환율: {dataset.metadata.baseRate.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-300 dark:bg-gray-600 hidden md:block"></div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">데이터 포인트</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        {dataset.data.length}개 시계열
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`inline-block w-2 h-2 rounded-full ${isRecent ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                  <span className={isRecent ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}>
                    {isRecent ? '최신 데이터' : '업데이트 대기 중'}
                  </span>
                </div>
              </div>
            </div>
          )
        })()}

        {/* 차트 또는 에러 메시지 */}
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-medium">
              데이터를 불러오는 중 오류가 발생했습니다
            </p>
            <p className="text-red-500 dark:text-red-500 text-sm mt-2">
              {error}
            </p>
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-4">
              개발 서버가 실행 중인지 확인하세요: <code>npm run dev</code>
            </p>
          </div>
        ) : dataset ? (
          <>
            {/* v2.0 핵심 지표 요약 */}
            <KeyIndicators latestData={dataset.data[dataset.data.length - 1]} />

            <KRWChart data={dataset.data} />

            {/* 투자 환경 진단 섹션 (v2.5) */}
            <div className="mt-8">
              <InvestmentSuggestion
                gap={dataset.data[dataset.data.length - 1].gap}
                marketRate={dataset.data[dataset.data.length - 1].marketRate}
                calculatedRate={dataset.data[dataset.data.length - 1].calculatedRate}
                latestData={dataset.data[dataset.data.length - 1]}
              />
            </div>
            {/* 설명 섹션 */}
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                데이터 설명
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    M2 기준 적정 환율
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    한국과 미국의 M2 통화량 증가 비율을 반영하여 계산한 이론적 환율입니다.
                    기준 시점({dataset.metadata.baseDate})의 환율({dataset.metadata.baseRate}원)을
                    기준으로 양국의 통화량 변화를 추적합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    괴리율 (Gap)
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    시장 환율이 M2 기준 적정 환율 대비 얼마나 벗어나 있는지를 백분율로 표시합니다.
                    양수(+)는 원화 저평가, 음수(-)는 원화 고평가를 의미합니다.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    데이터 소스
                  </h3>
                  <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 한국 M2: {dataset.metadata.sources.krM2}</li>
                    <li>• 미국 M2: {dataset.metadata.sources.usM2}</li>
                    <li>• 환율: {dataset.metadata.sources.exchangeRate}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    주의사항
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    이 도구는 참고용 지표이며, 투자 결정의 절대적 기준이 아닙니다.
                    정치적 리스크, 금리 차이, 무역 수지 등 다른 요인도 고려해야 합니다.
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-12">
            <p className="text-gray-500 dark:text-gray-400">데이터 로딩 중...</p>
          </div>
        )}
      </div>
    </main>
  )
}
