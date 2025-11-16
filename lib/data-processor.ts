/**
 * 데이터 처리 유틸리티
 *
 * 월별 M2 데이터를 일별로 보간하고, 최종 데이터셋 생성
 */

import { calculateFairRate, calculateGap, interpolateM2 } from './calculations'
import type { KRWData, KRWDataset } from './calculations'
import type { RawDataset, EcosM2Data, FredM2Data, ExchangeRateData } from './api/types'

/**
 * 월별 M2 데이터를 일별로 보간
 *
 * @param monthlyData - 월별 M2 데이터
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns 일별 M2 데이터
 */
export function interpolateM2Daily(
  monthlyData: Array<{ date: string; value: number }>,
  startDate: string,
  endDate: string
): Map<string, number> {
  const result = new Map<string, number>()

  // 월별 데이터를 정렬
  const sorted = [...monthlyData].sort((a, b) => a.date.localeCompare(b.date))

  // 날짜 범위 내의 모든 날짜에 대해 보간
  const start = new Date(startDate)
  const end = new Date(endDate)
  const current = new Date(start)

  while (current <= end) {
    const currentDateStr = current.toISOString().split('T')[0]
    const currentMonth = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`

    // 현재 날짜가 속한 월의 데이터 찾기
    const monthIndex = sorted.findIndex(d => d.date.startsWith(currentMonth))

    if (monthIndex >= 0 && monthIndex < sorted.length - 1) {
      // 다음 달 데이터가 있으면 보간
      const thisMonth = sorted[monthIndex]
      const nextMonth = sorted[monthIndex + 1]

      const thisMonthDate = new Date(thisMonth.date)
      const nextMonthDate = new Date(nextMonth.date)

      const interpolated = interpolateM2({
        monthStartM2: thisMonth.value,
        monthEndM2: nextMonth.value,
        monthStartDay: thisMonthDate.getDate(),
        monthEndDay: new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth() + 1, 0).getDate(),
        targetDay: current.getDate(),
      })

      result.set(currentDateStr, interpolated)
    } else if (monthIndex === sorted.length - 1) {
      // 마지막 월의 데이터는 그대로 사용
      result.set(currentDateStr, sorted[monthIndex].value)
    }

    // 다음 날로 이동
    current.setDate(current.getDate() + 1)
  }

  return result
}

/**
 * 원본 데이터를 최종 데이터셋으로 변환
 *
 * @param rawData - API에서 수집한 원본 데이터
 * @param config - 기준 설정
 * @returns 최종 데이터셋
 */
export function processRawData(
  rawData: RawDataset,
  config: {
    baseDate: string
    baseRate: number
    baseKrM2?: number
    baseUsM2?: number
  }
): KRWDataset {
  const { baseDate, baseRate } = config

  // 날짜 범위 결정 (기준일부터 현재까지)
  const endDate = new Date().toISOString().split('T')[0]

  // M2 데이터 일별 보간
  const krM2Daily = interpolateM2Daily(rawData.krM2, baseDate, endDate)
  const usM2Daily = interpolateM2Daily(rawData.usM2, baseDate, endDate)

  // 환율 데이터를 Map으로 변환
  const exchangeRateMap = new Map(
    rawData.exchangeRates.map(d => [d.date, d.rate])
  )

  // DXY 데이터를 Map으로 변환 (optional)
  const dxyMap = rawData.dxy
    ? new Map(rawData.dxy.map(d => [d.date, d.value]))
    : undefined

  // 기준일의 M2 값
  const baseKrM2 = config.baseKrM2 || krM2Daily.get(baseDate) || 0
  const baseUsM2 = config.baseUsM2 || usM2Daily.get(baseDate) || 0

  // 최종 데이터 생성
  const data: KRWData[] = []
  const dates = Array.from(krM2Daily.keys()).sort()

  for (const date of dates) {
    const marketRate = exchangeRateMap.get(date)
    const krM2 = krM2Daily.get(date)
    const usM2 = usM2Daily.get(date)

    // 필수 데이터가 모두 있는 경우만 포함
    if (marketRate && krM2 && usM2) {
      const calculatedRate = calculateFairRate({
        baseRate,
        baseKrM2,
        baseUsM2,
        currentKrM2: krM2,
        currentUsM2: usM2,
      })

      const gap = calculateGap(marketRate, calculatedRate)

      data.push({
        date,
        marketRate,
        krM2,
        usM2,
        calculatedRate,
        gap,
        dxy: dxyMap?.get(date),
      })
    }
  }

  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      baseDate,
      baseRate,
      sources: {
        krM2: 'ECOS (한국은행)',
        usM2: 'FRED (St. Louis Fed)',
        exchangeRate: 'ExchangeRate-API',
        dxy: 'FRED (St. Louis Fed)',
      },
    },
    data,
  }
}
