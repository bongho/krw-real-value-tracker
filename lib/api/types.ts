/**
 * API 클라이언트 타입 정의
 */

/**
 * ECOS API 응답 타입
 */
export interface EcosResponse {
  StatisticSearch: {
    list_total_count: number
    row: Array<{
      STAT_NAME: string
      STAT_CODE: string
      ITEM_CODE1: string
      ITEM_NAME1: string
      DATA_VALUE: string
      TIME: string // YYYYMM 형식
    }>
  }
}

export interface EcosM2Data {
  date: string // YYYY-MM-DD
  value: number // 조 원
}

/**
 * FRED API 응답 타입
 */
export interface FredResponse {
  observations: Array<{
    date: string // YYYY-MM-DD
    value: string // 숫자 문자열
  }>
}

export interface FredM2Data {
  date: string // YYYY-MM-DD
  value: number // 조 달러
}

/**
 * ExchangeRate-API 응답 타입
 */
export interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  target_code: string
  conversion_rate: number
}

export interface ExchangeRateData {
  date: string // YYYY-MM-DD
  rate: number // USD/KRW
}

/**
 * API 클라이언트 설정
 */
export interface ApiConfig {
  ecosApiKey: string
  fredApiKey: string
  exchangeRateApiKey: string
  baseDate: string
  baseRate: number
}

/**
 * 경제 지표 데이터 (공통 형식)
 */
export interface EconomicIndicatorData {
  date: string // YYYY-MM-DD
  value: number
}

/**
 * 수집된 원본 데이터 (v1.0 - 기본)
 */
export interface RawDataset {
  exchangeRates: ExchangeRateData[]
  krM2: EcosM2Data[]
  usM2: FredM2Data[]
  dxy?: FredM2Data[] // 달러 인덱스 (선택적)
}

/**
 * 확장 원본 데이터 (v2.0 - Gemini 피드백 반영)
 */
export interface ExtendedRawDataset extends RawDataset {
  // Priority 1: 자본유출입 지표
  krBaseRate?: EconomicIndicatorData[] // 한국 기준금리
  usFedRate?: EconomicIndicatorData[] // 미국 연방기금 금리

  // Priority 2: 펀더멘털 지표
  currentAccount?: EconomicIndicatorData[] // 경상수지
  tradeBalance?: EconomicIndicatorData[] // 무역수지
  krGdpGrowth?: EconomicIndicatorData[] // 한국 GDP 성장률
  usGdpGrowth?: EconomicIndicatorData[] // 미국 GDP 성장률

  // Priority 3: 장기가치 및 리스크 지표
  krCPI?: EconomicIndicatorData[] // 한국 CPI
  usCPI?: EconomicIndicatorData[] // 미국 CPI
  vix?: EconomicIndicatorData[] // VIX 지수
  cnyKrw?: ExchangeRateData[] // 위안/원 환율
}
