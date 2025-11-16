/**
 * 계산 로직 테스트
 * TDD 방식: 테스트를 먼저 작성하고, 구현은 나중에
 */

import {
  calculateFairRate,
  calculateGap,
  interpolateM2,
} from '../calculations'

describe('calculateFairRate', () => {
  it('should calculate fair exchange rate based on M2 ratios', () => {
    // Given: Base and current M2 data
    const baseRate = 1167 // 2010년 1월 1일 환율
    const baseKrM2 = 1500 // 조 원
    const baseUsM2 = 8.5 // 조 달러
    const currentKrM2 = 3800 // 조 원
    const currentUsM2 = 21.0 // 조 달러

    // When: Calculate fair rate
    const fairRate = calculateFairRate({
      baseRate,
      baseKrM2,
      baseUsM2,
      currentKrM2,
      currentUsM2,
    })

    // Then: Should return approximately 1197 won (rounded)
    expect(fairRate).toBe(1197)
  })

  it('should return baseRate when M2 ratios are unchanged', () => {
    const baseRate = 1200
    const baseKrM2 = 2000
    const baseUsM2 = 10.0

    const fairRate = calculateFairRate({
      baseRate,
      baseKrM2,
      baseUsM2,
      currentKrM2: 2000, // same as base
      currentUsM2: 10.0, // same as base
    })

    expect(fairRate).toBe(baseRate)
  })
})

describe('calculateGap', () => {
  it('should calculate positive gap when KRW is undervalued', () => {
    // Given: Market rate higher than fair rate (KRW undervalued)
    const marketRate = 1455
    const fairRate = 1196

    // When: Calculate gap
    const gap = calculateGap(marketRate, fairRate)

    // Then: Gap should be positive (approximately 21.7%)
    expect(gap).toBeCloseTo(21.7, 1)
  })

  it('should calculate negative gap when KRW is overvalued', () => {
    // Given: Market rate lower than fair rate (KRW overvalued)
    const marketRate = 1100
    const fairRate = 1200

    // When: Calculate gap
    const gap = calculateGap(marketRate, fairRate)

    // Then: Gap should be negative (approximately -8.3%)
    expect(gap).toBeCloseTo(-8.3, 1)
  })

  it('should return 0 when rates are equal', () => {
    const rate = 1200
    const gap = calculateGap(rate, rate)
    expect(gap).toBe(0)
  })
})

describe('interpolateM2', () => {
  it('should linearly interpolate M2 value for a given date', () => {
    // Given: Monthly M2 data
    const monthStartM2 = 3750 // Oct 1
    const monthEndM2 = 3800   // Nov 1
    const monthStartDay = 1
    const monthEndDay = 31
    const targetDay = 15 // Oct 15

    // When: Interpolate for Oct 15
    const interpolated = interpolateM2({
      monthStartM2,
      monthEndM2,
      monthStartDay,
      monthEndDay,
      targetDay,
    })

    // Then: Should be approximately 3773 (between 3750 and 3800, rounded)
    expect(interpolated).toBe(3773)
  })

  it('should return start value at beginning of month', () => {
    const monthStartM2 = 3750
    const monthEndM2 = 3800

    const interpolated = interpolateM2({
      monthStartM2,
      monthEndM2,
      monthStartDay: 1,
      monthEndDay: 31,
      targetDay: 1,
    })

    expect(interpolated).toBe(monthStartM2)
  })

  it('should return end value at end of month', () => {
    const monthStartM2 = 3750
    const monthEndM2 = 3800

    const interpolated = interpolateM2({
      monthStartM2,
      monthEndM2,
      monthStartDay: 1,
      monthEndDay: 31,
      targetDay: 31,
    })

    expect(interpolated).toBe(monthEndM2)
  })
})
