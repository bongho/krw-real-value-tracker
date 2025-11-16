'use client'

/**
 * KRW 실질 가치 차트 컴포넌트
 *
 * Dual Y-Axis 차트:
 * - 좌측: 환율 (시장 환율, 적정 환율)
 * - 우측: 괴리율 또는 DXY
 */

import React, { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { KRWData } from '@/lib/calculations'

interface KRWChartProps {
  data: KRWData[]
}

type TimeRange = '1Y' | '3Y' | '5Y' | 'ALL'

export function KRWChart({ data }: KRWChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('3Y')

  // 시간 범위에 따라 데이터 필터링
  const filteredData = useMemo(() => {
    if (timeRange === 'ALL') return data

    const now = new Date()
    const yearsAgo = new Date()

    switch (timeRange) {
      case '1Y':
        yearsAgo.setFullYear(now.getFullYear() - 1)
        break
      case '3Y':
        yearsAgo.setFullYear(now.getFullYear() - 3)
        break
      case '5Y':
        yearsAgo.setFullYear(now.getFullYear() - 5)
        break
    }

    const cutoffDate = yearsAgo.toISOString().split('T')[0]
    return data.filter(d => d.date >= cutoffDate)
  }, [data, timeRange])

  // 최신 데이터
  const latestData = filteredData[filteredData.length - 1] || data[data.length - 1]

  // 괴리율 색상 결정
  const getGapColor = (gap: number) => {
    if (gap > 3) return 'text-danger'
    if (gap < -3) return 'text-success'
    return 'text-gray-600'
  }

  const getGapText = (gap: number) => {
    if (gap > 3) return '원화 저평가'
    if (gap < -3) return '원화 고평가'
    return '적정 가치'
  }

  return (
    <div className="w-full">
      {/* 시간 범위 선택 버튼 */}
      <div className="flex gap-2 mb-6 justify-center">
        {(['1Y', '3Y', '5Y', 'ALL'] as TimeRange[]).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`
              px-4 py-2 rounded-lg font-medium transition-colors
              min-w-[60px] min-h-[44px]
              ${timeRange === range
                ? 'bg-primary text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }
            `}
          >
            {range}
          </button>
        ))}
      </div>

      {/* 차트 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 mb-6">
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart
            data={filteredData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value)
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              }}
              minTickGap={50}
            />
            <YAxis
              yAxisId="left"
              label={{ value: '환율 (원)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: '괴리율 (%)', angle: 90, position: 'insideRight' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                if (name === 'gap') return [`${value.toFixed(1)}%`, '괴리율']
                if (name === 'marketRate') return [`${value.toLocaleString()}원`, '시장 환율']
                if (name === 'calculatedRate') return [`${value.toLocaleString()}원`, 'M2 적정 환율']
                if (name === 'dxy') return [value.toFixed(1), '달러 인덱스']
                return [value, name]
              }}
              labelFormatter={(label) => {
                const date = new Date(label)
                return date.toLocaleDateString('ko-KR')
              }}
            />
            <Legend />

            {/* 괴리율 영역 */}
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="gap"
              fill="#EF4444"
              fillOpacity={0.2}
              stroke="none"
              name="괴리율"
            />

            {/* 시장 환율 */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="marketRate"
              stroke="#1E40AF"
              strokeWidth={3}
              dot={false}
              name="시장 환율"
            />

            {/* M2 적정 환율 */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="calculatedRate"
              stroke="#059669"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="M2 적정 환율"
            />

            {/* 달러 인덱스 (optional) */}
            {latestData?.dxy && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="dxy"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
                name="달러 인덱스"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 요약 박스 */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          현재 환율 상태
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">시장 환율</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {latestData?.marketRate.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">M2 적정 환율</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {latestData?.calculatedRate.toLocaleString()}원
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">괴리율</p>
            <p className={`text-2xl font-bold ${getGapColor(latestData?.gap || 0)}`}>
              {latestData?.gap > 0 ? '+' : ''}{latestData?.gap.toFixed(1)}%
              <span className="text-sm ml-2">
                ({getGapText(latestData?.gap || 0)})
              </span>
            </p>
          </div>
          {latestData?.dxy && (
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">달러 인덱스</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {latestData.dxy.toFixed(1)}
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            최종 업데이트: {new Date(latestData?.date || '').toLocaleDateString('ko-KR')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Data Sources: ECOS (KR M2), FRED (US M2), ExchangeRate-API (USD/KRW)
          </p>
        </div>
      </div>
    </div>
  )
}
