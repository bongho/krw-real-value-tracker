# KRW Real Value Tracker

원화 실질 가치 트래커 - M2 통화량 기반 환율 평가 대시보드

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/bongho/krw-real-value-tracker)

## 🚀 Live Demo

- **Production**: Coming soon (Vercel deployment)
- **Repository**: https://github.com/bongho/krw-real-value-tracker

## 프로젝트 개요

시장 환율(USD/KRW)과 통화량(M2)을 기준으로 계산된 '원화 실질 가치'를 시계열 차트로 비교하여, 현재 원화가 고평가/저평가되었는지 직관적으로 판단할 수 있는 **모바일 최적화 웹 대시보드**입니다.

### v2.5.1 주요 기능
- 📊 **M2 기준 적정 환율 vs 시장 환율** 시계열 비교 차트
- 🎯 **핵심 지표 요약** (금리차, VIX, 경상수지)
- 🧠 **AI 피드백 기반 투자 환경 종합 진단**
  - 5개 조건 명시적 임계값 표시
  - 조건 현황 요약 (5개 중 X개 충족)
  - 차단 조건 및 타이밍 가이드

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

**현재 버전**: v2.5.1 (UX 명확성 개선)

- [x] PRD 작성 및 v2.5.1 업데이트
- [x] 데이터 파이프라인 구축 (ECOS, FRED, ExchangeRate-API)
- [x] 프론트엔드 구현 (Next.js 14, Tailwind CSS)
- [x] 차트 구현 (Recharts)
- [x] v2.5 방아쇠 조건 로직 (Gemini AI 피드백 반영)
- [x] v2.5.1 명시적 임계값 메시징
- [x] GitHub repository 생성
- [ ] Vercel 배포
- [ ] 커스텀 도메인 설정

## 📚 문서

- [📋 PRD (Product Requirements Document)](./docs/PRD.md) - v2.5.1 UX 가이드라인 포함
- [⭐ API 연결 가이드](./docs/API-SETUP-GUIDE.md) - 실제 데이터 사용하기
- [📝 개발 로그](./docs/dev-log.md) - v2.5.1 구현 세부사항
- [🚀 배포 가이드](./docs/DEPLOYMENT.md) - Vercel 배포 단계별 안내

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

로컬 개발을 위해 `.env.local` 파일을 생성하고 다음 API 키를 설정하세요:

```env
ECOS_API_KEY=your_ecos_api_key_here
FRED_API_KEY=your_fred_api_key_here
EXCHANGERATE_API_KEY=your_exchangerate_api_key_here
```

### API 키 발급 방법

1. **ECOS API** (한국은행)
   - 🔗 https://ecos.bok.or.kr
   - 회원가입 → 인증키 신청

2. **FRED API** (미국 연방준비은행)
   - 🔗 https://fred.stlouisfed.org
   - 회원가입 → My Account → API Keys

3. **ExchangeRate-API**
   - 🔗 https://www.exchangerate-api.com
   - 이메일 입력 → Get Free Key

자세한 내용은 [API 연결 가이드](./docs/API-SETUP-GUIDE.md)를 참조하세요.

## 🚀 배포

Vercel에 배포하는 방법:

```bash
# Vercel CLI 설치
npm install -g vercel

# 배포
vercel --prod
```

배포 시 위의 환경 변수를 Vercel 대시보드에서 설정해야 합니다.
자세한 배포 절차는 [배포 가이드](./docs/DEPLOYMENT.md)를 참조하세요.

## 라이선스

MIT
