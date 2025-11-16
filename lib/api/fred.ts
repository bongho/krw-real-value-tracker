/**
 * FRED API 클라이언트
 *
 * API 문서: https://fred.stlouisfed.org/docs/api/fred/
 * Series:
 * - v1.0: M2SL, DTWEXBGS
 * - v2.0: INTDSRKRM193N, FEDFUNDS, VIXCLS, FPCPITOTLZGKOR, CPIAUCSL,
 *         NGDPRSAXDCKRQ, GDPC1, KORBCABP6USD, XTNTVA01KRQ667S
 */

import axios from 'axios'
import type { FredResponse, FredM2Data, EconomicIndicatorData } from './types'

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations'

// v1.0 Series
const M2_SERIES_ID = 'M2SL' // 미국 M2 (Seasonally Adjusted)
const DXY_SERIES_ID = 'DTWEXBGS' // Nominal Broad U.S. Dollar Index

// v2.0 Series - Priority 1: 자본유출입
const KR_BASE_RATE_ID = 'INTDSRKRM193N' // 한국 기준금리
const US_FED_RATE_ID = 'FEDFUNDS' // 미국 연방기금 금리 (월별)

// v2.0 Series - Priority 2: 펀더멘털
const KR_GDP_ID = 'NGDPRSAXDCKRQ' // 한국 실질 GDP
const US_GDP_ID = 'GDPC1' // 미국 실질 GDP
const CURRENT_ACCOUNT_ID = 'KORBCABP6USD' // 한국 경상수지 (USD)
const TRADE_BALANCE_ID = 'XTNTVA01KRQ667S' // 한국 무역수지

// v2.0 Series - Priority 3: 장기가치 및 리스크
const KR_CPI_ID = 'FPCPITOTLZGKOR' // 한국 CPI (World Bank)
const US_CPI_ID = 'CPIAUCSL' // 미국 CPI (All Urban Consumers)
const VIX_ID = 'VIXCLS' // CBOE Volatility Index

/**
 * FRED API에서 미국 M2 데이터 조회
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns M2 데이터 배열
 */
export async function fetchUSM2(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<FredM2Data[]> {
  return fetchFredSeries(apiKey, M2_SERIES_ID, startDate, endDate)
}

/**
 * FRED API에서 달러 인덱스 데이터 조회
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns DXY 데이터 배열
 */
export async function fetchDXY(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<FredM2Data[]> {
  return fetchFredSeries(apiKey, DXY_SERIES_ID, startDate, endDate)
}

/**
 * FRED API에서 한국 기준금리 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns 기준금리 데이터 배열 (%)
 */
export async function fetchKoreaBaseRate(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, KR_BASE_RATE_ID, startDate, endDate)
}

/**
 * FRED API에서 미국 연방기금 금리 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns 연방기금 금리 데이터 배열 (%)
 */
export async function fetchUSFedRate(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, US_FED_RATE_ID, startDate, endDate)
}

/**
 * FRED API에서 VIX 지수 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns VIX 데이터 배열
 */
export async function fetchVIX(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, VIX_ID, startDate, endDate)
}

/**
 * FRED API에서 한국 CPI 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns CPI 데이터 배열
 */
export async function fetchKoreaCPI(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, KR_CPI_ID, startDate, endDate)
}

/**
 * FRED API에서 미국 CPI 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns CPI 데이터 배열
 */
export async function fetchUSCPI(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, US_CPI_ID, startDate, endDate)
}

/**
 * FRED API에서 한국 GDP 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns GDP 데이터 배열
 */
export async function fetchKoreaGDP(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, KR_GDP_ID, startDate, endDate)
}

/**
 * FRED API에서 미국 GDP 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns GDP 데이터 배열
 */
export async function fetchUSGDP(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, US_GDP_ID, startDate, endDate)
}

/**
 * FRED API에서 한국 경상수지 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns 경상수지 데이터 배열 (USD)
 */
export async function fetchCurrentAccount(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, CURRENT_ACCOUNT_ID, startDate, endDate)
}

/**
 * FRED API에서 한국 무역수지 데이터 조회 (v2.0)
 *
 * @param apiKey - FRED API 키
 * @param startDate - 시작일 (YYYY-MM-DD)
 * @param endDate - 종료일 (YYYY-MM-DD)
 * @returns 무역수지 데이터 배열
 */
export async function fetchTradeBalance(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EconomicIndicatorData[]> {
  return fetchFredSeries(apiKey, TRADE_BALANCE_ID, startDate, endDate)
}

/**
 * FRED API 공통 조회 함수
 */
async function fetchFredSeries(
  apiKey: string,
  seriesId: string,
  startDate: string,
  endDate: string
): Promise<FredM2Data[]> {
  const url = `${FRED_BASE_URL}?series_id=${seriesId}&api_key=${apiKey}&file_type=json&observation_start=${startDate}&observation_end=${endDate}`

  try {
    const response = await axios.get<FredResponse>(url)

    if (!response.data?.observations) {
      throw new Error('Invalid FRED API response')
    }

    const data = response.data.observations
      .filter(obs => obs.value !== '.') // 결측치 제외
      .map(obs => ({
        date: obs.date,
        value: seriesId === M2_SERIES_ID
          ? parseFloat(obs.value) / 1000 // 십억 달러 -> 조 달러
          : parseFloat(obs.value), // DXY는 그대로
      }))

    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`FRED API error: ${error.message}`)
    }
    throw error
  }
}
