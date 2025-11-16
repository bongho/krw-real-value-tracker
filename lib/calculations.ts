/**
 * 핵심 계산 로직
 *
 * PRD 섹션 2.3, 2.4에 정의된 수식을 구현
 */

/**
 * M2 기준 적정 환율 계산
 *
 * 수식: 적정 환율(t) = 기준 환율 × [(KR_M2(t)/KR_M2(base)) / (US_M2(t)/US_M2(base))]
 *
 * @param params - 계산에 필요한 파라미터
 * @returns 적정 환율 (원/달러)
 */
export function calculateFairRate(params: {
  baseRate: number
  baseKrM2: number
  baseUsM2: number
  currentKrM2: number
  currentUsM2: number
}): number {
  const { baseRate, baseKrM2, baseUsM2, currentKrM2, currentUsM2 } = params

  // M2 증가율 계산
  const krM2Ratio = currentKrM2 / baseKrM2
  const usM2Ratio = currentUsM2 / baseUsM2

  // 적정 환율 = 기준 환율 × (KR M2 증가율 / US M2 증가율)
  const fairRate = baseRate * (krM2Ratio / usM2Ratio)

  return Math.round(fairRate) // 소수점 반올림
}

/**
 * 가치 괴리율 계산
 *
 * 수식: 괴리율(t) = [(Market_Rate(t) - 적정 환율(t)) / 적정 환율(t)] × 100
 *
 * @param marketRate - 시장 환율
 * @param fairRate - M2 기준 적정 환율
 * @returns 괴리율 (%)
 * - 양수: 원화 저평가 (달러가 비쌈)
 * - 음수: 원화 고평가 (달러가 쌈)
 */
export function calculateGap(marketRate: number, fairRate: number): number {
  const gap = ((marketRate - fairRate) / fairRate) * 100
  return Math.round(gap * 10) / 10 // 소수점 1자리까지
}

/**
 * M2 데이터 선형 보간
 *
 * 월별 M2 데이터를 일별 데이터로 변환
 *
 * 수식: M2(d) = M2(start) + (M2(end) - M2(start)) × (d - start_day) / (end_day - start_day)
 *
 * @param params - 보간 파라미터
 * @returns 보간된 M2 값
 */
export function interpolateM2(params: {
  monthStartM2: number
  monthEndM2: number
  monthStartDay: number
  monthEndDay: number
  targetDay: number
}): number {
  const {
    monthStartM2,
    monthEndM2,
    monthStartDay,
    monthEndDay,
    targetDay,
  } = params

  // 선형 보간 공식
  const daysDiff = monthEndDay - monthStartDay
  const targetOffset = targetDay - monthStartDay
  const m2Diff = monthEndM2 - monthStartM2

  const interpolated = monthStartM2 + (m2Diff * targetOffset) / daysDiff

  return Math.round(interpolated) // 정수로 반올림
}

/**
 * 한미 금리차 계산 (v2.0)
 *
 * 수식: 금리차(t) = KR_Base_Rate(t) - US_Fed_Rate(t)
 *
 * @param krBaseRate - 한국 기준금리 (%)
 * @param usFedRate - 미국 연방기금 금리 (%)
 * @returns 금리차 (%)
 * - 양수: 한국 금리가 높음 (원화 강세 압력)
 * - 음수: 미국 금리가 높음 (원화 약세 압력)
 */
export function calculateInterestRateDiff(
  krBaseRate: number,
  usFedRate: number
): number {
  const diff = krBaseRate - usFedRate
  return Math.round(diff * 100) / 100 // 소수점 2자리
}

/**
 * PPP 기반 적정 환율 계산 (v2.0)
 *
 * 수식: PPP_적정환율(t) = 기준환율 × [KR_CPI(t)/KR_CPI(base)] / [US_CPI(t)/US_CPI(base)]
 *
 * @param params - 계산 파라미터
 * @returns PPP 기반 적정 환율 (원/달러)
 */
export function calculatePPPRate(params: {
  baseRate: number
  baseKrCPI: number
  baseUsCPI: number
  currentKrCPI: number
  currentUsCPI: number
}): number {
  const { baseRate, baseKrCPI, baseUsCPI, currentKrCPI, currentUsCPI } = params

  // CPI 증가율 계산
  const krCPIRatio = currentKrCPI / baseKrCPI
  const usCPIRatio = currentUsCPI / baseUsCPI

  // PPP 적정 환율 = 기준 환율 × (KR CPI 증가율 / US CPI 증가율)
  const pppRate = baseRate * (krCPIRatio / usCPIRatio)

  return Math.round(pppRate) // 소수점 반올림
}

/**
 * GDP 성장률 격차 계산 (v2.0)
 *
 * 수식: 성장률 격차(t) = KR_GDP_Growth(t) - US_GDP_Growth(t)
 *
 * @param krGdpGrowth - 한국 GDP 성장률 (%)
 * @param usGdpGrowth - 미국 GDP 성장률 (%)
 * @returns GDP 성장률 격차 (%)
 */
export function calculateGdpGrowthDiff(
  krGdpGrowth: number,
  usGdpGrowth: number
): number {
  const diff = krGdpGrowth - usGdpGrowth
  return Math.round(diff * 10) / 10 // 소수점 1자리
}

/**
 * M2 상대 증가율 계산 (v2.0)
 *
 * 수식: M2_상대증가율(t) = [KR_M2_Growth_Rate(t) / US_M2_Growth_Rate(t)]
 *
 * @param params - 계산 파라미터
 * @returns M2 상대 증가율
 * - > 1: 한국이 미국보다 통화를 더 많이 공급 (원화 약세)
 * - < 1: 미국이 한국보다 통화를 더 많이 공급 (원화 강세)
 */
export function calculateM2GrowthRatio(params: {
  currentKrM2: number
  previousKrM2: number
  currentUsM2: number
  previousUsM2: number
}): number {
  const { currentKrM2, previousKrM2, currentUsM2, previousUsM2 } = params

  // YoY 증가율 계산
  const krGrowthRate = (currentKrM2 - previousKrM2) / previousKrM2
  const usGrowthRate = (currentUsM2 - previousUsM2) / previousUsM2

  // 상대 증가율
  const ratio = krGrowthRate / usGrowthRate

  return Math.round(ratio * 1000) / 1000 // 소수점 3자리
}

/**
 * 종합 평가 점수 계산 (v2.0)
 *
 * 가중치 기반 다중 지표 통합
 *
 * @param params - 각 지표의 표준화된 점수 (-1 ~ +1)
 * @param weights - 가중치 (기본값: PRD 권장)
 * @returns 종합 평가 점수 (-100 ~ +100)
 * - 양수: 원화 강세 요인 우세
 * - 음수: 원화 약세 요인 우세
 */
export function calculateCompositeScore(
  params: {
    rateDiffScore?: number // 금리차 점수
    currentAccountScore?: number // 경상수지 점수
    m2GapScore?: number // M2 괴리율 점수
    gdpGrowthScore?: number // GDP 성장률 점수
    cpiGapScore?: number // CPI 괴리율 점수
    vixScore?: number // VIX 리스크 점수
  },
  weights?: {
    rateDiff?: number
    currentAccount?: number
    m2Gap?: number
    gdpGrowth?: number
    cpiGap?: number
    vix?: number
  }
): number {
  // 기본 가중치 (PRD 권장값)
  const defaultWeights = {
    rateDiff: 0.3, // 30%
    currentAccount: 0.25, // 25%
    m2Gap: 0.2, // 20%
    gdpGrowth: 0.1, // 10%
    cpiGap: 0.1, // 10%
    vix: 0.05, // 5%
  }

  const w = { ...defaultWeights, ...weights }

  // 가중 평균 계산
  let totalScore = 0
  let totalWeight = 0

  if (params.rateDiffScore !== undefined) {
    totalScore += params.rateDiffScore * w.rateDiff
    totalWeight += w.rateDiff
  }
  if (params.currentAccountScore !== undefined) {
    totalScore += params.currentAccountScore * w.currentAccount
    totalWeight += w.currentAccount
  }
  if (params.m2GapScore !== undefined) {
    totalScore += params.m2GapScore * w.m2Gap
    totalWeight += w.m2Gap
  }
  if (params.gdpGrowthScore !== undefined) {
    totalScore += params.gdpGrowthScore * w.gdpGrowth
    totalWeight += w.gdpGrowth
  }
  if (params.cpiGapScore !== undefined) {
    totalScore += params.cpiGapScore * w.cpiGap
    totalWeight += w.cpiGap
  }
  if (params.vixScore !== undefined) {
    totalScore += params.vixScore * w.vix
    totalWeight += w.vix
  }

  // 정규화 (사용 가능한 지표만으로 100점 만점 환산)
  const normalizedScore = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0

  return Math.round(normalizedScore * 10) / 10 // 소수점 1자리
}

/**
 * 타입 정의
 */
export interface KRWData {
  date: string // ISO date format (YYYY-MM-DD)
  marketRate: number // 시장 환율 (USD/KRW)
  krM2: number // 한국 M2 (조 원)
  usM2: number // 미국 M2 (조 달러)
  calculatedRate: number // M2 기준 적정 환율
  gap: number // 괴리율 (%)
  dxy?: number // 달러 인덱스 (optional)
}

/**
 * 확장 데이터 타입 (v2.0 - Gemini 피드백 반영)
 */
export interface ExtendedKRWData extends KRWData {
  // Priority 1: 자본유출입 지표
  krBaseRate?: number // 한국 기준금리 (%)
  usFedRate?: number // 미국 연방기금 금리 (%)
  rateDiff?: number // 금리차 (%)

  // Priority 2: 펀더멘털 지표
  currentAccount?: number // 경상수지 (USD)
  tradeBalance?: number // 무역수지
  krGdpGrowth?: number // 한국 GDP 성장률 (%)
  usGdpGrowth?: number // 미국 GDP 성장률 (%)
  gdpGrowthDiff?: number // GDP 성장률 격차 (%)

  // Priority 3: 장기가치 및 리스크 지표
  krCPI?: number // 한국 CPI
  usCPI?: number // 미국 CPI
  vix?: number // VIX 지수
  cnyKrw?: number // 위안/원 환율

  // 추가 계산 지표
  pppRate?: number // PPP 기반 적정 환율
  m2GrowthRatio?: number // M2 상대 증가율
  compositeScore?: number // 종합 평가 점수
}

export interface KRWDataset {
  metadata: {
    lastUpdated: string
    baseDate: string
    baseRate: number
    sources: {
      krM2: string
      usM2: string
      exchangeRate: string
      dxy?: string
    }
  }
  data: KRWData[]
}

export interface ExtendedKRWDataset {
  metadata: {
    lastUpdated: string
    baseDate: string
    baseRate: number
    version: string // v1.0 or v2.0
    sources: {
      krM2: string
      usM2: string
      exchangeRate: string
      dxy?: string
      krBaseRate?: string
      usFedRate?: string
      currentAccount?: string
      tradeBalance?: string
      krGdpGrowth?: string
      usGdpGrowth?: string
      krCPI?: string
      usCPI?: string
      vix?: string
      cnyKrw?: string
    }
  }
  data: ExtendedKRWData[]
}
