'use client'

/**
 * 핵심 지표 요약 컴포넌트 (v2.0)
 *
 * Priority 1: 자본유출입 지표 (금리차, VIX)
 * Priority 2: 펀더멘털 지표 (경상수지)
 *
 * PRD 2.6-2.9에 정의된 확장 지표 체계 반영
 */

import type { ExtendedKRWData } from '@/lib/calculations'

interface KeyIndicatorsProps {
  latestData: ExtendedKRWData
}

export default function KeyIndicators({ latestData }: KeyIndicatorsProps) {
  // 금리차 해석 (v2.5.1: 투자 적격 명시)
  const getRateDiffStatus = (diff?: number) => {
    if (diff === undefined) return { text: 'N/A', color: 'text-gray-500', bg: 'bg-gray-50' }
    if (diff > 1) return { text: '원화 강세 (투자 유리)', color: 'text-green-600', bg: 'bg-green-50' }
    if (diff < -1.5) return { text: '원화 약세 (투자 부적합)', color: 'text-red-600', bg: 'bg-red-50' }
    if (diff < -1) return { text: '원화 약세 압력', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: '중립 (정상)', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  // VIX 해석 (v2.5.1: 투자 적격 명시)
  const getVIXStatus = (vix?: number) => {
    if (vix === undefined) return { text: 'N/A', color: 'text-gray-500', bg: 'bg-gray-50' }
    if (vix >= 40) return { text: '극심한 공포 (투자 부적합)', color: 'text-red-700', bg: 'bg-red-100' }
    if (vix >= 25) return { text: 'Risk-Off (투자 부적합)', color: 'text-red-600', bg: 'bg-red-50' }
    if (vix < 15) return { text: 'Risk-On (매우 안정)', color: 'text-green-600', bg: 'bg-green-50' }
    return { text: '정상 범위 (투자 가능)', color: 'text-gray-600', bg: 'bg-gray-50' }
  }

  const rateDiffStatus = getRateDiffStatus(latestData.rateDiff)
  const vixStatus = getVIXStatus(latestData.vix)

  return (
    <div className="w-full mb-6">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
        핵심 지표 요약
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority 1: 한미 금리차 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Priority 1: 금리차
            </span>
            <span className={`text-xs px-2 py-1 rounded ${rateDiffStatus.bg} ${rateDiffStatus.color} font-medium`}>
              {rateDiffStatus.text}
            </span>
          </div>

          {latestData.krBaseRate !== undefined && latestData.usFedRate !== undefined ? (
            <>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">한국 기준금리</span>
                  <span className="font-semibold text-gray-800">
                    {latestData.krBaseRate.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">미국 Fed 금리</span>
                  <span className="font-semibold text-gray-800">
                    {latestData.usFedRate.toFixed(2)}%
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">금리차</span>
                    <span className={`text-lg font-bold ${latestData.rateDiff! >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {latestData.rateDiff! >= 0 ? '+' : ''}{latestData.rateDiff!.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                {latestData.rateDiff! < -1
                  ? '미국 금리가 높아 달러 자산 투자 유인 증가. 자본 유출 압력.'
                  : latestData.rateDiff! > 1
                  ? '한국 금리가 높아 원화 자산 투자 유인 증가. 자본 유입 압력.'
                  : '금리 격차가 크지 않아 자본 이동 압력 제한적.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-3">데이터 없음</p>
          )}
        </div>

        {/* Priority 3: VIX 지수 (리스크) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Priority 3: 변동성
            </span>
            <span className={`text-xs px-2 py-1 rounded ${vixStatus.bg} ${vixStatus.color} font-medium`}>
              {vixStatus.text}
            </span>
          </div>

          {latestData.vix !== undefined ? (
            <>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-800">
                    {latestData.vix.toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">VIX Index</span>
                </div>

                {/* VIX 게이지 */}
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      latestData.vix >= 40 ? 'bg-red-700' :
                      latestData.vix >= 25 ? 'bg-red-500' :
                      latestData.vix < 15 ? 'bg-green-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(latestData.vix / 50 * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                {latestData.vix >= 25
                  ? 'VIX 상승: 시장 불안정. 원화 같은 위험 자산에서 자본 유출 가능.'
                  : latestData.vix < 15
                  ? 'VIX 낮음: 시장 안정. 원화 같은 위험 자산 선호도 증가.'
                  : '정상 범위: 특별한 리스크 신호 없음.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-3">데이터 없음</p>
          )}
        </div>

        {/* Priority 2: 경상수지 */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Priority 2: 펀더멘털
            </span>
            <span className={`text-xs px-2 py-1 rounded ${
              latestData.currentAccount && latestData.currentAccount > 0
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            } font-medium`}>
              {latestData.currentAccount && latestData.currentAccount > 0 ? '흑자' : '적자'}
            </span>
          </div>

          {latestData.currentAccount !== undefined ? (
            <>
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-800">
                    {(latestData.currentAccount / 1_000_000_000).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">billion USD</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">경상수지</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                {latestData.tradeBalance !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">무역수지</span>
                    <span className="font-semibold text-gray-800">
                      {(latestData.tradeBalance / 1_000_000).toFixed(1)}M
                    </span>
                  </div>
                )}
              </div>

              <p className="mt-3 text-xs text-gray-500 leading-relaxed">
                {latestData.currentAccount > 0
                  ? '경상수지 흑자: 수출로 달러를 벌어들여 원화 강세 압력 제공.'
                  : '경상수지 적자: 수입으로 달러가 필요해 원화 약세 압력.'}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-3">데이터 없음</p>
          )}
        </div>
      </div>

      {/* 종합 해석 */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">
          종합 분석 (Gemini AI 피드백 반영)
        </h3>
        <p className="text-sm text-blue-800 leading-relaxed">
          <strong>단기 (금리차):</strong> {rateDiffStatus.text} •{' '}
          <strong>변동성:</strong> {vixStatus.text} •{' '}
          <strong>중기 (경상수지):</strong> {
            latestData.currentAccount && latestData.currentAccount > 0 ? '원화 지지 요인' : 'N/A'
          }
        </p>
        <p className="text-xs text-blue-600 mt-2">
          ⚠️ 환율은 다층적 요인의 종합입니다. M2 괴리율과 함께 이 지표들을 고려하세요.
        </p>
      </div>
    </div>
  )
}
