'use client'

/**
 * 투자 환경 진단 컴포넌트 (v2.5)
 *
 * Gemini AI 평가 반영: "신호"에서 "종합 진단"으로
 * - M2 괴리율만이 아닌 다중 지표 종합 평가
 * - 방아쇠 조건(Trigger Conditions) 적용
 * - 차단 조건 명시
 */

import React from 'react'
import type { ExtendedKRWData } from '@/lib/calculations'
import {
  evaluateInvestmentEnvironment,
  getSignalColor,
  getSignalBgColor,
  getConditionIcon,
  getConditionColor,
} from '@/lib/signal-logic'

interface InvestmentSuggestionProps {
  gap: number
  marketRate: number
  calculatedRate: number
  latestData?: ExtendedKRWData // v2.5: 확장 데이터
}

export function InvestmentSuggestion({
  gap,
  marketRate,
  calculatedRate,
  latestData,
}: InvestmentSuggestionProps) {
  // v2.5: 종합 환경 평가
  const environment = latestData
    ? evaluateInvestmentEnvironment(latestData)
    : null

  // 레거시 모드 (확장 데이터 없을 때)
  if (!environment) {
    return (
      <div className="rounded-lg border-2 bg-gray-50 border-gray-400 p-6 shadow-lg">
        <div className="text-center">
          <p className="text-gray-600">
            확장 지표 데이터가 없습니다. v2.0 데이터를 수집해주세요.
          </p>
        </div>
      </div>
    )
  }

  const { overallSignal, overallMessage, conditions, blockers, timingGuidance } = environment

  // v2.5.1: 조건 현황 카운터 계산
  const conditionsArray = Object.values(conditions)
  const passCount = conditionsArray.filter(c => c.status === 'PASS').length
  const failCount = conditionsArray.filter(c => c.status === 'FAIL').length
  const naCount = conditionsArray.filter(c => c.status === 'N/A').length

  return (
    <div className="rounded-lg border-2 border-gray-300 bg-white p-6 shadow-lg">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          📊 원화 투자 환경 종합 진단
        </h2>
        <p className="text-sm text-gray-600">
          M2 괴리율 + Priority 지표 + 시장 심리를 종합 평가합니다
        </p>
      </div>

      {/* 최종 판단 */}
      <div
        className={`rounded-lg p-5 mb-6 ${getSignalBgColor(overallSignal)} border-2 ${
          overallSignal === 'HOLD' ? 'border-yellow-400' :
          overallSignal === 'BUY' || overallSignal === 'STRONG_BUY' ? 'border-green-400' :
          'border-red-400'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-2xl font-bold ${getSignalColor(overallSignal)}`}>
              {overallSignal === 'HOLD' ? '🔴' :
               overallSignal === 'BUY' || overallSignal === 'STRONG_BUY' ? '🟢' : '🔴'}{' '}
              최종 판단: {overallMessage}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              M2 괴리율: {gap > 0 ? '+' : ''}{gap.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* v2.5.1: 조건 현황 요약 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">
          📋 핵심 투자 조건 현황 (5개 중 {passCount}개 충족)
        </h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span className="text-green-700">
              <strong>{passCount}개</strong> 충족
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-xl">❌</span>
            <span className="text-red-700">
              <strong>{failCount}개</strong> 미충족
            </span>
          </span>
          {naCount > 0 && (
            <span className="flex items-center gap-2">
              <span className="text-xl">➖</span>
              <span className="text-gray-500">
                <strong>{naCount}개</strong> N/A
              </span>
            </span>
          )}
        </div>
      </div>

      {/* 조건별 평가 */}
      <div className="space-y-4 mb-6">
        <h3 className="font-semibold text-gray-800 text-lg mb-3">
          📋 조건별 상세 평가
        </h3>

        {/* 1. 가치 평가 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(conditions.value.status)}</span>
                <h4 className={`font-semibold ${getConditionColor(conditions.value.status)}`}>
                  1. {conditions.value.name}
                </h4>
              </div>
              <p className="text-sm text-gray-700 ml-7">
                {conditions.value.message}
              </p>
              {conditions.value.current !== undefined && (
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  현재: {conditions.value.current > 0 ? '+' : ''}{conditions.value.current.toFixed(1)}%
                  {' '}(기준: {conditions.value.thresholdLabel})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 2. 금리차 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(conditions.rateDiff.status)}</span>
                <h4 className={`font-semibold ${getConditionColor(conditions.rateDiff.status)}`}>
                  2. {conditions.rateDiff.name}
                  {conditions.rateDiff.isCritical && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      차단 조건
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-sm text-gray-700 ml-7">
                {conditions.rateDiff.message}
              </p>
              {conditions.rateDiff.current !== undefined && (
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  현재: {conditions.rateDiff.current > 0 ? '+' : ''}{conditions.rateDiff.current.toFixed(2)}%p
                  {' '}(목표: {conditions.rateDiff.thresholdLabel})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3. 달러 인덱스 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(conditions.dxy.status)}</span>
                <h4 className={`font-semibold ${getConditionColor(conditions.dxy.status)}`}>
                  3. {conditions.dxy.name}
                  {conditions.dxy.isCritical && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      차단 조건
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-sm text-gray-700 ml-7">
                {conditions.dxy.message}
              </p>
              {conditions.dxy.current !== undefined && (
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  현재: {conditions.dxy.current.toFixed(1)} (목표: {conditions.dxy.thresholdLabel})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 4. VIX */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(conditions.vix.status)}</span>
                <h4 className={`font-semibold ${getConditionColor(conditions.vix.status)}`}>
                  4. {conditions.vix.name}
                  {conditions.vix.isCritical && (
                    <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      차단 조건
                    </span>
                  )}
                </h4>
              </div>
              <p className="text-sm text-gray-700 ml-7">
                {conditions.vix.message}
              </p>
              {conditions.vix.current !== undefined && (
                <p className="text-xs text-gray-500 ml-7 mt-1">
                  현재: {conditions.vix.current.toFixed(1)} (목표: {conditions.vix.thresholdLabel})
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 5. 펀더멘털 */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{getConditionIcon(conditions.fundamental.status)}</span>
                <h4 className={`font-semibold ${getConditionColor(conditions.fundamental.status)}`}>
                  5. {conditions.fundamental.name}
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    보조 지표
                  </span>
                </h4>
              </div>
              <p className="text-sm text-gray-700 ml-7">
                {conditions.fundamental.message}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 차단 조건 목록 */}
      {blockers.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            🚫 투자 차단 조건 ({blockers.length}개)
          </h3>
          <ul className="space-y-2">
            {blockers.map((blocker, index) => (
              <li key={index} className="text-sm text-red-700 flex items-start gap-2">
                <span className="text-red-500 font-bold">•</span>
                <span>{blocker}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 타이밍 가이드 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          🕐 투자 타이밍 가이드
        </h3>
        <p className="text-sm text-blue-800 leading-relaxed mb-4">
          {timingGuidance}
        </p>

        {blockers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm font-medium text-blue-900 mb-2">
              투자 고려 시점:
            </p>
            <ul className="space-y-1 text-sm text-blue-700">
              {conditions.rateDiff.status === 'FAIL' && (
                <li>• <strong>단기 (1-3개월):</strong> Fed 금리 인하 or 한국 금리 인상 → 금리차 축소</li>
              )}
              {conditions.dxy.status === 'FAIL' && (
                <li>• <strong>중기 (3-6개월):</strong> 달러 약세 전환 → DXY 110 이하</li>
              )}
              {conditions.vix.status === 'FAIL' && (
                <li>• <strong>즉시:</strong> 시장 안정화 → VIX 25 이하</li>
              )}
            </ul>
            <p className="text-xs text-blue-600 mt-3">
              ⚠️ 모든 조건이 충족되기 전까지는 <strong>'기다림'이 최선의 전략</strong>일 수 있습니다.
            </p>
          </div>
        )}
      </div>

      {/* 면책 조항 */}
      <div className="border-t border-gray-200 pt-4 mt-6">
        <p className="text-xs text-gray-500 leading-relaxed">
          ⓘ 이 진단은 M2 통화량, 금리차, 시장 심리 등 복합 요인을 분석한 <strong>참고 자료</strong>이며,{' '}
          <strong>투자 조언이 아닙니다</strong>. 실제 투자 결정 시에는 재무 상담사와 상의하시고,
          투자에 따른 손실은 투자자 본인의 책임입니다.
        </p>
      </div>
    </div>
  )
}
