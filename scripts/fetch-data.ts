/**
 * 실제 API에서 데이터 수집 스크립트
 *
 * ECOS, FRED, ExchangeRate-API에서 실제 데이터를 가져옵니다
 */

import * as dotenv from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'
import { fetchKoreaM2, formatDateForEcos } from '../lib/api/ecos'
import {
  fetchUSM2,
  fetchDXY,
  fetchKoreaBaseRate,
  fetchUSFedRate,
  fetchVIX,
  fetchKoreaCPI,
  fetchUSCPI,
  fetchKoreaGDP,
  fetchUSGDP,
  fetchCurrentAccount,
  fetchTradeBalance,
} from '../lib/api/fred'
import { fetchCurrentRate } from '../lib/api/exchange-rate'
import { processRawData } from '../lib/data-processor'
import type { ExtendedRawDataset } from '../lib/api/types'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

async function main() {
  console.log('🚀 Starting real data collection from APIs...\n')

  // 환경 변수 확인
  const ecosApiKey = process.env.ECOS_API_KEY
  const fredApiKey = process.env.FRED_API_KEY
  const exchangeRateApiKey = process.env.EXCHANGE_RATE_API_KEY
  const baseDate = process.env.BASE_DATE || '2010-01-01'
  const baseRate = parseInt(process.env.BASE_RATE || '1167')

  if (!ecosApiKey || !fredApiKey || !exchangeRateApiKey) {
    console.error('❌ Error: API keys not found in .env.local')
    console.error('Please set ECOS_API_KEY, FRED_API_KEY, and EXCHANGE_RATE_API_KEY')
    process.exit(1)
  }

  console.log('✓ Environment variables loaded')
  console.log(`  Base Date: ${baseDate}`)
  console.log(`  Base Rate: ${baseRate} KRW\n`)

  try {
    const rawData: ExtendedRawDataset = {
      exchangeRates: [],
      krM2: [],
      usM2: [],
      dxy: [],
      // v2.0 확장 지표
      krBaseRate: [],
      usFedRate: [],
      vix: [],
      krCPI: [],
      usCPI: [],
      krGdpGrowth: [],
      usGdpGrowth: [],
      currentAccount: [],
      tradeBalance: [],
    }

    // 1. 현재 환율 가져오기
    console.log('📊 Fetching current exchange rate...')
    const currentRate = await fetchCurrentRate(exchangeRateApiKey)
    console.log(`✓ Current rate: ${currentRate.rate} KRW (${currentRate.date})`)

    // 현재 환율만 추가 (과거 데이터는 무료 플랜에서 제공하지 않음)
    rawData.exchangeRates.push(currentRate)

    // 2. 한국 M2 데이터 가져오기
    console.log('\n📊 Fetching Korea M2 data from ECOS...')
    const startDateEcos = formatDateForEcos(new Date(baseDate))
    const endDateEcos = formatDateForEcos(new Date())

    const krM2Data = await fetchKoreaM2(ecosApiKey, startDateEcos, endDateEcos)
    rawData.krM2 = krM2Data
    console.log(`✓ Korea M2: ${krM2Data.length} data points`)
    console.log(`  Latest: ${krM2Data[krM2Data.length - 1].value} trillion KRW (${krM2Data[krM2Data.length - 1].date})`)

    // 3. 미국 M2 데이터 가져오기
    console.log('\n📊 Fetching US M2 data from FRED...')
    const usM2Data = await fetchUSM2(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
    rawData.usM2 = usM2Data
    console.log(`✓ US M2: ${usM2Data.length} data points`)
    console.log(`  Latest: ${usM2Data[usM2Data.length - 1].value.toFixed(1)} trillion USD (${usM2Data[usM2Data.length - 1].date})`)

    // 4. 달러 인덱스 가져오기
    console.log('\n📊 Fetching Dollar Index (DXY) from FRED...')
    const dxyData = await fetchDXY(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
    rawData.dxy = dxyData
    console.log(`✓ DXY: ${dxyData.length} data points`)
    console.log(`  Latest: ${dxyData[dxyData.length - 1].value.toFixed(1)} (${dxyData[dxyData.length - 1].date})`)

    // 5. Priority 1: 금리 데이터 가져오기
    console.log('\n📊 Fetching Interest Rates from FRED...')
    try {
      const krBaseRateData = await fetchKoreaBaseRate(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.krBaseRate = krBaseRateData
      console.log(`✓ Korea Base Rate: ${krBaseRateData.length} data points`)
      if (krBaseRateData.length > 0) {
        console.log(`  Latest: ${krBaseRateData[krBaseRateData.length - 1].value.toFixed(2)}% (${krBaseRateData[krBaseRateData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  Korea Base Rate fetch failed:', error instanceof Error ? error.message : error)
    }

    try {
      const usFedRateData = await fetchUSFedRate(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.usFedRate = usFedRateData
      console.log(`✓ US Fed Rate: ${usFedRateData.length} data points`)
      if (usFedRateData.length > 0) {
        console.log(`  Latest: ${usFedRateData[usFedRateData.length - 1].value.toFixed(2)}% (${usFedRateData[usFedRateData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  US Fed Rate fetch failed:', error instanceof Error ? error.message : error)
    }

    // 6. Priority 3: VIX 데이터 가져오기
    console.log('\n📊 Fetching VIX Index from FRED...')
    try {
      const vixData = await fetchVIX(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.vix = vixData
      console.log(`✓ VIX: ${vixData.length} data points`)
      if (vixData.length > 0) {
        console.log(`  Latest: ${vixData[vixData.length - 1].value.toFixed(1)} (${vixData[vixData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  VIX fetch failed:', error instanceof Error ? error.message : error)
    }

    // 7. Priority 3: CPI 데이터 가져오기
    console.log('\n📊 Fetching CPI data from FRED...')
    try {
      const krCPIData = await fetchKoreaCPI(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.krCPI = krCPIData
      console.log(`✓ Korea CPI: ${krCPIData.length} data points`)
      if (krCPIData.length > 0) {
        console.log(`  Latest: ${krCPIData[krCPIData.length - 1].value.toFixed(1)} (${krCPIData[krCPIData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  Korea CPI fetch failed:', error instanceof Error ? error.message : error)
    }

    try {
      const usCPIData = await fetchUSCPI(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.usCPI = usCPIData
      console.log(`✓ US CPI: ${usCPIData.length} data points`)
      if (usCPIData.length > 0) {
        console.log(`  Latest: ${usCPIData[usCPIData.length - 1].value.toFixed(1)} (${usCPIData[usCPIData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  US CPI fetch failed:', error instanceof Error ? error.message : error)
    }

    // 8. Priority 2: GDP 데이터 가져오기
    console.log('\n📊 Fetching GDP data from FRED...')
    try {
      const krGDPData = await fetchKoreaGDP(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.krGdpGrowth = krGDPData
      console.log(`✓ Korea GDP: ${krGDPData.length} data points`)
      if (krGDPData.length > 0) {
        console.log(`  Latest: ${krGDPData[krGDPData.length - 1].value.toFixed(1)} (${krGDPData[krGDPData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  Korea GDP fetch failed:', error instanceof Error ? error.message : error)
    }

    try {
      const usGDPData = await fetchUSGDP(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.usGdpGrowth = usGDPData
      console.log(`✓ US GDP: ${usGDPData.length} data points`)
      if (usGDPData.length > 0) {
        console.log(`  Latest: ${usGDPData[usGDPData.length - 1].value.toFixed(1)} (${usGDPData[usGDPData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  US GDP fetch failed:', error instanceof Error ? error.message : error)
    }

    // 9. Priority 2: 경상수지/무역수지 데이터 가져오기
    console.log('\n📊 Fetching Trade data from FRED...')
    try {
      const currentAccountData = await fetchCurrentAccount(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.currentAccount = currentAccountData
      console.log(`✓ Current Account: ${currentAccountData.length} data points`)
      if (currentAccountData.length > 0) {
        console.log(`  Latest: ${currentAccountData[currentAccountData.length - 1].value.toFixed(1)} USD (${currentAccountData[currentAccountData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  Current Account fetch failed:', error instanceof Error ? error.message : error)
    }

    try {
      const tradeBalanceData = await fetchTradeBalance(fredApiKey, baseDate, new Date().toISOString().split('T')[0])
      rawData.tradeBalance = tradeBalanceData
      console.log(`✓ Trade Balance: ${tradeBalanceData.length} data points`)
      if (tradeBalanceData.length > 0) {
        console.log(`  Latest: ${tradeBalanceData[tradeBalanceData.length - 1].value.toFixed(1)} (${tradeBalanceData[tradeBalanceData.length - 1].date})`)
      }
    } catch (error) {
      console.warn('⚠️  Trade Balance fetch failed:', error instanceof Error ? error.message : error)
    }

    // 5. 데이터 처리
    console.log('\n⚙️  Processing data...')

    // 기준 시점의 M2 값 찾기
    const baseKrM2 = rawData.krM2.find(d => d.date.startsWith(baseDate.substring(0, 7)))?.value || 1500
    const baseUsM2 = rawData.usM2.find(d => d.date.startsWith(baseDate.substring(0, 7)))?.value || 8.5

    console.log(`  Base KR M2: ${baseKrM2} trillion KRW`)
    console.log(`  Base US M2: ${baseUsM2} trillion USD`)

    // Note: 환율 과거 데이터가 없으므로, 현재 데이터만 사용하거나
    // 샘플 데이터와 혼합하여 사용해야 함
    console.log('\n⚠️  Note: ExchangeRate-API free plan only provides current rate')
    console.log('   For historical data, consider using Alpha Vantage or other APIs')
    console.log('   Current implementation will use sample data for historical rates\n')

    // 샘플 데이터 생성기를 import하여 과거 데이터 생성
    const { generateSampleData } = await import('./generate-sample-data')
    const sampleDataset = generateSampleData()

    // 최신 데이터만 실제 API 값으로 교체
    const latestSampleData = sampleDataset.data[sampleDataset.data.length - 1]
    latestSampleData.marketRate = currentRate.rate
    latestSampleData.krM2 = krM2Data[krM2Data.length - 1].value
    latestSampleData.usM2 = usM2Data[usM2Data.length - 1].value
    if (dxyData.length > 0) {
      latestSampleData.dxy = dxyData[dxyData.length - 1].value
    }

    // v2.0 확장 지표 추가
    if (rawData.krBaseRate && rawData.krBaseRate.length > 0) {
      latestSampleData.krBaseRate = rawData.krBaseRate[rawData.krBaseRate.length - 1].value
    }
    if (rawData.usFedRate && rawData.usFedRate.length > 0) {
      latestSampleData.usFedRate = rawData.usFedRate[rawData.usFedRate.length - 1].value
    }
    if (rawData.vix && rawData.vix.length > 0) {
      latestSampleData.vix = rawData.vix[rawData.vix.length - 1].value
    }
    if (rawData.krCPI && rawData.krCPI.length > 0) {
      latestSampleData.krCPI = rawData.krCPI[rawData.krCPI.length - 1].value
    }
    if (rawData.usCPI && rawData.usCPI.length > 0) {
      latestSampleData.usCPI = rawData.usCPI[rawData.usCPI.length - 1].value
    }
    if (rawData.krGdpGrowth && rawData.krGdpGrowth.length > 0) {
      latestSampleData.krGdpGrowth = rawData.krGdpGrowth[rawData.krGdpGrowth.length - 1].value
    }
    if (rawData.usGdpGrowth && rawData.usGdpGrowth.length > 0) {
      latestSampleData.usGdpGrowth = rawData.usGdpGrowth[rawData.usGdpGrowth.length - 1].value
    }
    if (rawData.currentAccount && rawData.currentAccount.length > 0) {
      latestSampleData.currentAccount = rawData.currentAccount[rawData.currentAccount.length - 1].value
    }
    if (rawData.tradeBalance && rawData.tradeBalance.length > 0) {
      latestSampleData.tradeBalance = rawData.tradeBalance[rawData.tradeBalance.length - 1].value
    }

    // 적정 환율 재계산
    const { calculateFairRate, calculateGap, calculateInterestRateDiff } = await import('../lib/calculations')
    latestSampleData.calculatedRate = calculateFairRate({
      baseRate,
      baseKrM2,
      baseUsM2,
      currentKrM2: latestSampleData.krM2,
      currentUsM2: latestSampleData.usM2,
    })
    latestSampleData.gap = calculateGap(latestSampleData.marketRate, latestSampleData.calculatedRate)

    // v2.0 확장 계산
    if (latestSampleData.krBaseRate !== undefined && latestSampleData.usFedRate !== undefined) {
      latestSampleData.rateDiff = calculateInterestRateDiff(
        latestSampleData.krBaseRate,
        latestSampleData.usFedRate
      )
    }

    // 메타데이터 업데이트
    sampleDataset.metadata.lastUpdated = new Date().toISOString()
    sampleDataset.metadata.version = 'v2.0'
    sampleDataset.metadata.sources = {
      krM2: 'ECOS (Bank of Korea)',
      usM2: 'FRED (St. Louis Fed)',
      exchangeRate: 'ExchangeRate-API (current only, historical from estimates)',
      dxy: 'FRED (St. Louis Fed)',
      krBaseRate: rawData.krBaseRate && rawData.krBaseRate.length > 0 ? 'FRED (INTDSRKRM193N)' : undefined,
      usFedRate: rawData.usFedRate && rawData.usFedRate.length > 0 ? 'FRED (FEDFUNDS)' : undefined,
      vix: rawData.vix && rawData.vix.length > 0 ? 'FRED (VIXCLS)' : undefined,
      krCPI: rawData.krCPI && rawData.krCPI.length > 0 ? 'FRED (FPCPITOTLZGKOR)' : undefined,
      usCPI: rawData.usCPI && rawData.usCPI.length > 0 ? 'FRED (CPIAUCSL)' : undefined,
      krGdpGrowth: rawData.krGdpGrowth && rawData.krGdpGrowth.length > 0 ? 'FRED (NGDPRSAXDCKRQ)' : undefined,
      usGdpGrowth: rawData.usGdpGrowth && rawData.usGdpGrowth.length > 0 ? 'FRED (GDPC1)' : undefined,
      currentAccount: rawData.currentAccount && rawData.currentAccount.length > 0 ? 'FRED (KORBCABP6USD)' : undefined,
      tradeBalance: rawData.tradeBalance && rawData.tradeBalance.length > 0 ? 'FRED (XTNTVA01KRQ667S)' : undefined,
    }

    // 6. 파일 저장
    console.log('💾 Saving data...')
    const dataDir = path.join(process.cwd(), 'public', 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    const outputPath = path.join(dataDir, 'krw-data.json')
    fs.writeFileSync(outputPath, JSON.stringify(sampleDataset, null, 2))

    console.log(`✓ Data saved to: ${outputPath}`)

    // 7. 결과 출력
    console.log('\n✅ Data collection completed successfully!\n')
    console.log('📊 Latest Data Summary (v2.0):')
    console.log('─'.repeat(50))
    console.log(`Date:           ${latestSampleData.date}`)
    console.log(`Market Rate:    ${latestSampleData.marketRate.toLocaleString()} KRW`)
    console.log(`Fair Rate (M2): ${latestSampleData.calculatedRate.toLocaleString()} KRW`)
    console.log(`Gap:            ${latestSampleData.gap > 0 ? '+' : ''}${latestSampleData.gap.toFixed(1)}%`)
    console.log(`KR M2:          ${latestSampleData.krM2.toLocaleString()} trillion KRW`)
    console.log(`US M2:          ${latestSampleData.usM2.toFixed(1)} trillion USD`)
    if (latestSampleData.dxy) {
      console.log(`DXY:            ${latestSampleData.dxy.toFixed(1)}`)
    }
    console.log('─'.repeat(50))
    console.log('🆕 Extended Indicators (v2.0):')
    if (latestSampleData.krBaseRate !== undefined && latestSampleData.usFedRate !== undefined) {
      console.log(`KR Base Rate:   ${latestSampleData.krBaseRate.toFixed(2)}%`)
      console.log(`US Fed Rate:    ${latestSampleData.usFedRate.toFixed(2)}%`)
      console.log(`Rate Diff:      ${latestSampleData.rateDiff! > 0 ? '+' : ''}${latestSampleData.rateDiff!.toFixed(2)}%`)
    }
    if (latestSampleData.vix !== undefined) {
      console.log(`VIX Index:      ${latestSampleData.vix.toFixed(1)}`)
    }
    if (latestSampleData.currentAccount !== undefined) {
      console.log(`Current Acct:   ${latestSampleData.currentAccount.toFixed(1)} billion USD`)
    }
    console.log('─'.repeat(50))

    if (latestSampleData.gap > 10) {
      console.log('\n🟢 Signal: KRW is undervalued (consider buying KRW)')
    } else if (latestSampleData.gap < -10) {
      console.log('\n🔴 Signal: KRW is overvalued (consider selling KRW)')
    } else {
      console.log('\n⚪ Signal: KRW is fairly valued (hold)')
    }

    console.log('\n✨ Refresh your browser to see the updated data!')

  } catch (error) {
    console.error('\n❌ Error during data collection:')
    if (error instanceof Error) {
      console.error(`   ${error.message}`)
      if (error.stack) {
        console.error('\nStack trace:')
        console.error(error.stack)
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  }
}

// 실행
main()
