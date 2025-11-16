# KRW Real Value Tracker

원화 실질 가치 트래커 - M2 통화량 기반 환율 평가 대시보드

## 프로젝트 개요

시장 환율(USD/KRW)과 통화량(M2)을 기준으로 계산된 '원화 실질 가치'를 시계열 차트로 비교하여, 현재 원화가 고평가/저평가되었는지 직관적으로 판단할 수 있는 모바일 최적화 웹 대시보드입니다.

## 핵심 개념

- **M2 기준 적정 환율**: 한국과 미국의 M2 통화량 증가 비율을 반영한 이론적 환율
- **괴리율 (Gap)**: 시장 환율과 적정 환율의 차이를 백분율로 표시
  - 양수(+): 원화 저평가 (달러가 비쌈)
  - 음수(-): 원화 고평가 (달러가 쌈)

## 기술 스택

- **Frontend**: Next.js 14, React 18, Recharts, Tailwind CSS
- **Backend**: Node.js Scripts, GitHub Actions
- **Data Sources**: ECOS API (한국 M2), FRED API (미국 M2), ExchangeRate-API (환율)
- **Deployment**: Vercel

## 개발 진행 상황

현재 상태: 초기 개발 중

- [x] PRD 작성
- [ ] 데이터 파이프라인 구축
- [ ] 프론트엔드 기본 구조
- [ ] 차트 구현
- [ ] 배포

## 문서

- [PRD (Product Requirements Document)](./docs/PRD.md)
- [API 연결 가이드](./docs/API-SETUP-GUIDE.md) ⭐ 실제 데이터 사용하기
- [개발 로그](./docs/dev-log.md)

## 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 환경 변수

`.env.local` 파일을 생성하고 다음 API 키를 설정하세요:

```
ECOS_API_KEY=your_ecos_api_key
FRED_API_KEY=your_fred_api_key
EXCHANGE_RATE_API_KEY=your_exchange_rate_api_key
```

## 라이선스

MIT
