/**
 * 투자 신호 로직 (v2.5)
 *
 * Gemini AI 평가 반영: "신호"에서 "종합 진단"으로
 * - M2 괴리율: 필요조건 (Necessary Condition)
 * - Priority 1, DXY, VIX: 방아쇠 조건 (Trigger Conditions)
 */

import type { ExtendedKRWData } from './calculations'

export type SignalLevel = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL'
export type ConditionStatus = 'PASS' | 'FAIL' | 'N/A'

export interface InvestmentCondition {
  name: string
  status: ConditionStatus
  current: number | undefined
  threshold: number
  thresholdLabel: string
  message: string
  isCritical: boolean // 차단 조건 여부
}

export interface InvestmentEnvironment {
  overallSignal: SignalLevel
  overallMessage: string
  overallColor: string
  conditions: {
    value: InvestmentCondition
    rateDiff: InvestmentCondition
    dxy: InvestmentCondition
    vix: InvestmentCondition
    fundamental: InvestmentCondition
  }
  blockers: string[] // 차단 조건 목록
  readyToBuy: boolean
  timingGuidance: string
}

/**
 * 투자 환경 종합 평가
 */
export function evaluateInvestmentEnvironment(
  data: ExtendedKRWData
): InvestmentEnvironment {
  // 1. M2 괴리율 평가 (필요조건)
  const valueCondition: InvestmentCondition = {
    name: '가치 평가 (M2 기준)',
    status: data.gap > 15 ? 'PASS' : data.gap < -15 ? 'FAIL' : 'N/A',
    current: data.gap,
    threshold: 15,
    thresholdLabel: '+15% 이상',
    message:
      data.gap > 15
        ? `저평가 수준입니다. 현재 M2 괴리율 ${data.gap > 0 ? '+' : ''}${data.gap.toFixed(1)}% (기준: +15% 이상). 장기 투자 관점에서 매력적인 가치입니다.`
        : data.gap < -15
        ? `고평가 수준입니다. 현재 M2 괴리율 ${data.gap.toFixed(1)}% (기준: +15% 이상). 매수에 부적합한 구간입니다.`
        : `적정 가치 범위입니다. 현재 M2 괴리율 ${data.gap > 0 ? '+' : ''}${data.gap.toFixed(1)}% (기준: -15% ~ +15%). 저평가/고평가 신호가 명확하지 않습니다.`,
    isCritical: false,
  }

  // 2. Priority 1: 금리차 평가 (차단 조건)
  const rateDiffCondition: InvestmentCondition = {
    name: '이자 매력도 (Priority 1: 금리차)',
    status:
      data.rateDiff === undefined
        ? 'N/A'
        : data.rateDiff > -1.5
        ? 'PASS'
        : 'FAIL',
    current: data.rateDiff,
    threshold: -1.5,
    thresholdLabel: '-1.5%p 이내',
    message:
      data.rateDiff === undefined
        ? '데이터 없음'
        : data.rateDiff > -1.5
        ? `적정 수준입니다. 현재 금리차 ${data.rateDiff >= 0 ? '+' : ''}${data.rateDiff.toFixed(2)}%p (기준: -1.5%p 이상). ${data.rateDiff > 1 ? '한국 금리가 높아 원화 보유 유리합니다. ' : '금리 격차가 제한적입니다. '}투자 적격 조건을 충족합니다.`
        : data.rateDiff < -2
        ? `미국 금리가 현저히 높습니다. 현재 금리차 ${data.rateDiff.toFixed(2)}%p (기준: -1.5%p 이상). 달러 보유가 절대적으로 유리합니다. 투자 적격 조건을 미충족합니다.`
        : `미국 금리가 높습니다. 현재 금리차 ${data.rateDiff.toFixed(2)}%p (기준: -1.5%p 이상). 달러 보유가 유리합니다. 투자 적격 조건을 미충족합니다.`,
    isCritical: true,
  }

  // 3. 달러 인덱스 평가 (차단 조건)
  const dxyCondition: InvestmentCondition = {
    name: '시장 심리 (달러 인덱스)',
    status: data.dxy === undefined ? 'N/A' : data.dxy < 110 ? 'PASS' : 'FAIL',
    current: data.dxy,
    threshold: 110,
    thresholdLabel: '110 이하',
    message:
      data.dxy === undefined
        ? '데이터 없음'
        : data.dxy < 110
        ? `정상 범위입니다. 현재 DXY ${data.dxy.toFixed(1)} (기준: 110 이하). 달러 초강세가 아니며, 투자 적격 조건을 충족합니다.`
        : data.dxy >= 120
        ? `달러 역사적 초강세입니다. 현재 DXY ${data.dxy.toFixed(1)} (기준: 110 이하). 위험자산 회피 심리가 극심합니다. 투자 적격 조건을 미충족합니다.`
        : `달러 강세입니다. 현재 DXY ${data.dxy.toFixed(1)} (기준: 110 이하). 안전자산 선호 심리가 강합니다. 투자 적격 조건을 미충족합니다.`,
    isCritical: true,
  }

  // 4. VIX 평가 (차단 조건)
  const vixCondition: InvestmentCondition = {
    name: '변동성 (VIX 지수)',
    status: data.vix === undefined ? 'N/A' : data.vix < 25 ? 'PASS' : 'FAIL',
    current: data.vix,
    threshold: 25,
    thresholdLabel: '25 이하',
    message:
      data.vix === undefined
        ? '데이터 없음'
        : data.vix < 25
        ? `정상 범위입니다. 현재 VIX ${data.vix.toFixed(1)} (기준: 25 이하). ${data.vix < 15 ? '매우 안정적인 시장입니다. ' : '시장 변동성이 관리 가능한 수준입니다. '}투자 적격 조건을 충족합니다.`
        : data.vix >= 40
        ? `극심한 공포 상태입니다. 현재 VIX ${data.vix.toFixed(1)} (기준: 25 이하). 위험자산 급락 가능성이 높습니다. 투자 적격 조건을 미충족합니다.`
        : `Risk-Off 국면입니다. 현재 VIX ${data.vix.toFixed(1)} (기준: 25 이하). 시장 불안정으로 자본 유출 압력이 있습니다. 투자 적격 조건을 미충족합니다.`,
    isCritical: true,
  }

  // 5. 펀더멘털 평가 (보조 지표)
  const fundamentalCondition: InvestmentCondition = {
    name: '펀더멘털 (경상수지)',
    status:
      data.currentAccount === undefined
        ? 'N/A'
        : data.currentAccount > 0
        ? 'PASS'
        : 'FAIL',
    current: data.currentAccount,
    threshold: 0,
    thresholdLabel: '흑자',
    message:
      data.currentAccount === undefined
        ? '데이터 없음'
        : data.currentAccount > 0
        ? `흑자 상태입니다. 현재 경상수지 $${(data.currentAccount / 1_000_000_000).toFixed(1)}B (기준: 흑자). 수출 호조로 원화 강세 압력이 있습니다. 투자 긍정 요인입니다.`
        : `적자 상태입니다. 현재 경상수지 $${(data.currentAccount / 1_000_000_000).toFixed(1)}B (기준: 흑자). 경상수지 적자로 원화 약세 압력이 있습니다. 투자 부정 요인입니다.`,
    isCritical: false,
  }

  // 차단 조건 확인
  const blockers: string[] = []
  if (rateDiffCondition.status === 'FAIL') {
    blockers.push(
      `금리차: ${rateDiffCondition.thresholdLabel} 필요 (현재: ${rateDiffCondition.current?.toFixed(2)}%p)`
    )
  }
  if (dxyCondition.status === 'FAIL') {
    blockers.push(
      `달러 인덱스: ${dxyCondition.thresholdLabel} 필요 (현재: ${dxyCondition.current?.toFixed(1)})`
    )
  }
  if (vixCondition.status === 'FAIL') {
    blockers.push(
      `VIX: ${vixCondition.thresholdLabel} 필요 (현재: ${vixCondition.current?.toFixed(1)})`
    )
  }

  // 최종 신호 결정
  const readyToBuy =
    valueCondition.status === 'PASS' &&
    rateDiffCondition.status === 'PASS' &&
    dxyCondition.status === 'PASS' &&
    vixCondition.status === 'PASS'

  let overallSignal: SignalLevel
  let overallMessage: string
  let overallColor: string
  let timingGuidance: string

  if (readyToBuy) {
    // 모든 조건 충족
    overallSignal = data.gap > 20 ? 'STRONG_BUY' : 'BUY'
    overallMessage = '매수 신호'
    overallColor = 'green'
    timingGuidance = '모든 조건이 충족되었습니다. 투자를 고려할 수 있는 시점입니다.'
  } else if (valueCondition.status === 'PASS') {
    // 가치는 매력적이나 타이밍 부적합
    overallSignal = 'HOLD'
    overallMessage = '관망 (HOLD)'
    overallColor = 'yellow'
    timingGuidance =
      'M2 기준 가치는 매력적이나, 아래 차단 조건들이 투자에 불리합니다. 조건 개선 시 재검토하세요.'
  } else if (valueCondition.status === 'FAIL') {
    // 고평가 구간
    overallSignal = data.gap < -20 ? 'STRONG_SELL' : 'SELL'
    overallMessage = '매도/중립'
    overallColor = 'red'
    timingGuidance = '원화가 고평가되어 있어 매수에 부적합합니다.'
  } else {
    // 적정 가치
    overallSignal = 'HOLD'
    overallMessage = '중립 (HOLD)'
    overallColor = 'gray'
    timingGuidance = '적정 가치 범위입니다. 다른 조건 변화를 모니터링하세요.'
  }

  return {
    overallSignal,
    overallMessage,
    overallColor,
    conditions: {
      value: valueCondition,
      rateDiff: rateDiffCondition,
      dxy: dxyCondition,
      vix: vixCondition,
      fundamental: fundamentalCondition,
    },
    blockers,
    readyToBuy,
    timingGuidance,
  }
}

/**
 * 신호 레벨에 따른 색상 반환
 */
export function getSignalColor(signal: SignalLevel): string {
  switch (signal) {
    case 'STRONG_BUY':
      return 'text-green-700'
    case 'BUY':
      return 'text-green-600'
    case 'HOLD':
      return 'text-yellow-600'
    case 'SELL':
      return 'text-red-600'
    case 'STRONG_SELL':
      return 'text-red-700'
  }
}

/**
 * 신호 레벨에 따른 배경색 반환
 */
export function getSignalBgColor(signal: SignalLevel): string {
  switch (signal) {
    case 'STRONG_BUY':
      return 'bg-green-100'
    case 'BUY':
      return 'bg-green-50'
    case 'HOLD':
      return 'bg-yellow-50'
    case 'SELL':
      return 'bg-red-50'
    case 'STRONG_SELL':
      return 'bg-red-100'
  }
}

/**
 * 조건 상태에 따른 아이콘 반환
 */
export function getConditionIcon(status: ConditionStatus): string {
  switch (status) {
    case 'PASS':
      return '✅'
    case 'FAIL':
      return '❌'
    case 'N/A':
      return '➖'
  }
}

/**
 * 조건 상태에 따른 색상 반환
 */
export function getConditionColor(status: ConditionStatus): string {
  switch (status) {
    case 'PASS':
      return 'text-green-600'
    case 'FAIL':
      return 'text-red-600'
    case 'N/A':
      return 'text-gray-400'
  }
}
