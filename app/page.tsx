import { KRWChart } from '@/components/KRWChart'
import { InvestmentSuggestion } from '@/components/InvestmentSuggestion'
import KeyIndicators from '@/components/KeyIndicators'
import type { KRWDataset } from '@/lib/calculations'

async function getData(): Promise<KRWDataset> {
  // 정적 JSON 파일 로드
  const res = await fetch('http://localhost:3000/data/krw-data.json', {
    cache: 'no-store', // 개발 중에는 캐시 비활성화
  })

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
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
