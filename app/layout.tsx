import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KRW Real Value Tracker',
  description: '원화 실질 가치 트래커 - M2 통화량 기반 환율 평가',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#1E40AF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
