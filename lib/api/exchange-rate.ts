/**
 * ExchangeRate-API 클라이언트
 *
 * API 문서: https://www.exchangerate-api.com/docs
 * 무료 플랜: 1,500 requests/month
 */

import axios from 'axios'
import type { ExchangeRateResponse, ExchangeRateData } from './types'

const EXCHANGE_RATE_BASE_URL = 'https://v6.exchangerate-api.com/v6'

/**
 * 현재 USD/KRW 환율 조회
 *
 * @param apiKey - ExchangeRate-API 키
 * @returns 현재 환율 데이터
 */
export async function fetchCurrentRate(apiKey: string): Promise<ExchangeRateData> {
  const url = `${EXCHANGE_RATE_BASE_URL}/${apiKey}/pair/USD/KRW`

  try {
    const response = await axios.get<ExchangeRateResponse>(url)

    if (response.data.result !== 'success') {
      throw new Error('ExchangeRate-API request failed')
    }

    // 현재 날짜 (UTC 기준)
    const date = new Date(response.data.time_last_update_utc)
    const dateStr = date.toISOString().split('T')[0]

    return {
      date: dateStr,
      rate: response.data.conversion_rate,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`ExchangeRate-API error: ${error.message}`)
    }
    throw error
  }
}

/**
 * 과거 환율 데이터는 무료 플랜에서 지원하지 않으므로,
 * 대안으로 Alpha Vantage 사용을 고려하거나,
 * 일일 크론 작업으로 매일 데이터를 축적해야 함
 *
 * 현재는 현재 환율만 조회하고, 과거 데이터는 별도로 저장
 */
