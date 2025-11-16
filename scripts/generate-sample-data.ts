/**
 * 현실적인 샘플 데이터 생성 스크립트
 *
 * 실제 시장 데이터에 가까운 값으로 생성
 * 2010-01-01부터 현재까지의 데이터
 */

import * as fs from 'fs'
import * as path from 'path'
import { calculateFairRate, calculateGap } from '../lib/calculations'
import type { KRWDataset, KRWData } from '../lib/calculations'

// 기준 설정
const BASE_DATE = '2010-01-01'
const BASE_RATE = 1167 // 2010년 환율
const BASE_KR_M2 = 1500 // 조 원
const BASE_US_M2 = 8.5 // 조 달러

// 현재 (2025년 11월) 추정값
const CURRENT_RATE = 1448 // 실제 시장 환율
const CURRENT_KR_M2 = 3800 // 조 원 (추정)
const CURRENT_US_M2 = 21.0 // 조 달러 (추정)

/**
 * 날짜 범위 생성
 */
function generateDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = []
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    dates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  return dates
}

/**
 * 현실적인 환율 생성
 * 2010년 1,167원 → 2025년 1,448원으로 점진적 증가
 */
function generateRealisticExchangeRate(
  dayIndex: number,
  totalDays: number
): number {
  const progress = dayIndex / totalDays

  // 기본 추세 (선형 증가)
  const trend = BASE_RATE + (CURRENT_RATE - BASE_RATE) * progress

  // 단기 변동성 (±5% 범위)
  const volatility = 0.05
  const noise = Math.sin(dayIndex / 30) * trend * volatility * 0.5 +
                 Math.sin(dayIndex / 90) * trend * volatility * 0.3 +
                 (Math.random() - 0.5) * trend * volatility * 0.2

  return Math.round(trend + noise)
}

/**
 * 현실적인 M2 생성
 */
function generateRealisticM2(
  baseValue: number,
  currentValue: number,
  dayIndex: number,
  totalDays: number
): number {
  const progress = dayIndex / totalDays

  // 지수 성장 (실제 M2는 지수적으로 증가)
  const growthFactor = Math.log(currentValue / baseValue)
  const value = baseValue * Math.exp(growthFactor * progress)

  // 약간의 노이즈
  const noise = (Math.random() - 0.5) * value * 0.01

  return Math.round(value + noise)
}

/**
 * 현실적인 샘플 데이터 생성
 */
function generateSampleData(): KRWDataset {
  const today = new Date().toISOString().split('T')[0]
  const dates = generateDateRange(BASE_DATE, today)
  const totalDays = dates.length

  const data: KRWData[] = dates.map((date, index) => {
    // M2 데이터 생성 (지수 성장)
    const krM2 = generateRealisticM2(BASE_KR_M2, CURRENT_KR_M2, index, totalDays)
    const usM2 = Math.round(
      generateRealisticM2(BASE_US_M2, CURRENT_US_M2, index, totalDays) * 10
    ) / 10

    // 적정 환율 계산
    const calculatedRate = calculateFairRate({
      baseRate: BASE_RATE,
      baseKrM2: BASE_KR_M2,
      baseUsM2: BASE_US_M2,
      currentKrM2: krM2,
      currentUsM2: usM2,
    })

    // 현실적인 시장 환율 생성
    const marketRate = generateRealisticExchangeRate(index, totalDays)

    // 실제 괴리율 계산
    const gap = calculateGap(marketRate, calculatedRate)

    // 달러 인덱스 (95-110 범위, 주기적 변동)
    const dxy = Math.round(
      (100 +
       Math.sin(index / 365) * 8 +
       Math.sin(index / 90) * 5 +
       (Math.random() - 0.5) * 3) * 10
    ) / 10

    return {
      date,
      marketRate,
      krM2,
      usM2,
      calculatedRate,
      gap,
      dxy,
    }
  })

  return {
    metadata: {
      lastUpdated: new Date().toISOString(),
      baseDate: BASE_DATE,
      baseRate: BASE_RATE,
      sources: {
        krM2: 'SAMPLE DATA (realistic estimates based on ECOS)',
        usM2: 'SAMPLE DATA (realistic estimates based on FRED)',
        exchangeRate: 'SAMPLE DATA (realistic estimates, current: 1,448 KRW)',
        dxy: 'SAMPLE DATA (FRED)',
      },
    },
    data,
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('Generating realistic sample data...')
  console.log(`Current market rate: ${CURRENT_RATE} KRW`)
  console.log(`Current KR M2: ${CURRENT_KR_M2} trillion KRW`)
  console.log(`Current US M2: ${CURRENT_US_M2} trillion USD`)

  const dataset = generateSampleData()

  // public/data 디렉토리 확인
  const dataDir = path.join(process.cwd(), 'public', 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  // JSON 파일로 저장
  const outputPath = path.join(dataDir, 'krw-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(dataset, null, 2))

  // 최종 데이터 확인
  const latestData = dataset.data[dataset.data.length - 1]

  console.log(`\n✅ Realistic sample data generated successfully!`)
  console.log(`   Location: ${outputPath}`)
  console.log(`   Data points: ${dataset.data.length}`)
  console.log(`   Date range: ${dataset.data[0].date} ~ ${latestData.date}`)
  console.log(`\n📊 Latest data (${latestData.date}):`)
  console.log(`   Market Rate: ${latestData.marketRate.toLocaleString()} KRW`)
  console.log(`   M2 Fair Rate: ${latestData.calculatedRate.toLocaleString()} KRW`)
  console.log(`   Gap: ${latestData.gap > 0 ? '+' : ''}${latestData.gap.toFixed(1)}% (${latestData.gap > 0 ? 'KRW undervalued' : 'KRW overvalued'})`)
  console.log(`   KR M2: ${latestData.krM2.toLocaleString()} trillion KRW`)
  console.log(`   US M2: ${latestData.usM2.toFixed(1)} trillion USD`)
  console.log(`   DXY: ${latestData.dxy}`)
}

// 실행
if (require.main === module) {
  main()
}

export { generateSampleData }
