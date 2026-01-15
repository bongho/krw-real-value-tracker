/**
 * 한국은행 ECOS API 클라이언트
 *
 * API 문서: https://ecos.bok.or.kr/api/
 * 통계코드: 101Y004 (광의통화 M2, 평잔)
 */

import axios from 'axios'
import type { EcosResponse, EcosM2Data } from './types'

const ECOS_BASE_URL = 'https://ecos.bok.or.kr/api'
const STAT_CODE = '101Y004' // 광의통화 M2
const CYCLE = 'M' // 월별

/**
 * ECOS API에서 한국 M2 데이터 조회
 *
 * @param apiKey - ECOS API 인증키
 * @param startDate - 시작일 (YYYYMM)
 * @param endDate - 종료일 (YYYYMM)
 * @returns M2 데이터 배열
 */
export async function fetchKoreaM2(
  apiKey: string,
  startDate: string,
  endDate: string
): Promise<EcosM2Data[]> {
  const url = `${ECOS_BASE_URL}/StatisticSearch/${apiKey}/json/kr/1/10000/${STAT_CODE}/${CYCLE}/${startDate}/${endDate}/`

  try {
    const response = await axios.get<EcosResponse>(url)

    // ECOS API 에러 응답 처리
    if (response.data?.RESULT) {
      const { CODE, MESSAGE } = response.data.RESULT
      throw new Error(`ECOS API error [${CODE}]: ${MESSAGE}`)
    }

    if (!response.data?.StatisticSearch?.row) {
      throw new Error('Invalid ECOS API response: StatisticSearch.row not found')
    }

    const data = response.data.StatisticSearch.row
      .filter(item => item.ITEM_CODE1 === 'BBHA00') // M2 총액만 필터링
      .map(item => {
        // TIME 형식: YYYYMM -> YYYY-MM-DD (매월 1일)
        const year = item.TIME.substring(0, 4)
        const month = item.TIME.substring(4, 6)
        const date = `${year}-${month}-01`

        // DATA_VALUE는 십억 원 단위 -> 조 원으로 변환
        const valueInBillions = parseFloat(item.DATA_VALUE)
        const valueInTrillions = valueInBillions / 1000

        return {
          date,
          value: Math.round(valueInTrillions * 10) / 10, // 소수점 1자리
        }
      })

    return data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`ECOS API error: ${error.message}`)
    }
    throw error
  }
}

/**
 * 날짜를 YYYYMM 형식으로 변환
 */
export function formatDateForEcos(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}${month}`
}
