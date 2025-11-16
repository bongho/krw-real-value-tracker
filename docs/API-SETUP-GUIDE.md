# API 연결 가이드

실제 환율 및 M2 데이터를 사용하기 위한 API 키 발급 및 설정 가이드입니다.

---

## 필요한 API 목록

1. **한국은행 ECOS API** (한국 M2 데이터)
2. **FRED API** (미국 M2, 달러 인덱스)
3. **ExchangeRate-API** (USD/KRW 환율)

모두 **무료**로 사용 가능합니다!

---

## 1. 한국은행 ECOS API 설정

### 1.1 회원가입 및 API 키 발급

1. **ECOS 사이트 접속**
   - URL: https://ecos.bok.or.kr/api/

2. **회원가입**
   - 우측 상단 "회원가입" 클릭
   - 이메일, 비밀번호 등 기본 정보 입력
   - 이메일 인증 완료

3. **API 키 발급**
   - 로그인 후 "인증키 신청/관리" 메뉴 클릭
   - "인증키 신청" 버튼 클릭
   - 사용 목적: "개인 프로젝트" 또는 "학습용"
   - **인증키가 즉시 발급됩니다** (예: `ABC123XYZ456...`)

4. **키 복사**
   - 발급받은 인증키를 복사해두세요

### 1.2 데이터 확인

- **통계명**: 광의통화(M2) - 평잔
- **통계코드**: `101Y004`
- **주기**: 월별 (M)
- **테스트 URL**:
  ```
  https://ecos.bok.or.kr/api/StatisticSearch/YOUR_API_KEY/json/kr/1/10/101Y004/M/202001/202512/
  ```

---

## 2. FRED API 설정

### 2.1 계정 생성 및 API 키 발급

1. **FRED 사이트 접속**
   - URL: https://fred.stlouisfed.org/

2. **계정 생성**
   - 우측 상단 "My Account" 클릭
   - "Create new account" 선택
   - 이메일, 비밀번호 입력 후 가입

3. **API 키 발급**
   - 로그인 후 "My Account" → "API Keys" 메뉴 클릭
   - URL: https://fred.stlouisfed.org/docs/api/api_key.html
   - "Request API Key" 버튼 클릭
   - API 키가 즉시 발급됩니다

4. **키 복사**
   - 발급받은 API 키를 복사해두세요

### 2.2 데이터 확인

#### 미국 M2
- **Series ID**: `M2SL`
- **설명**: M2 Money Stock (Seasonally Adjusted)
- **테스트 URL**:
  ```
  https://api.stlouisfed.org/fred/series/observations?series_id=M2SL&api_key=YOUR_API_KEY&file_type=json
  ```

#### 달러 인덱스 (DXY)
- **Series ID**: `DTWEXBGS`
- **설명**: Nominal Broad U.S. Dollar Index
- **테스트 URL**:
  ```
  https://api.stlouisfed.org/fred/series/observations?series_id=DTWEXBGS&api_key=YOUR_API_KEY&file_type=json
  ```

---

## 3. ExchangeRate-API 설정

### 3.1 무료 플랜 가입

1. **ExchangeRate-API 사이트 접속**
   - URL: https://www.exchangerate-api.com

2. **무료 플랜 선택**
   - "Get Free Key" 버튼 클릭
   - 이메일 주소 입력
   - 약관 동의 후 "Get Started" 클릭

3. **이메일 확인**
   - 가입 시 입력한 이메일로 API 키가 전송됩니다
   - 이메일에서 API 키를 복사

4. **무료 플랜 제한**
   - 월 1,500 requests
   - 일 1회 데이터 수집으로 충분합니다 (월 30회)

### 3.2 데이터 확인

- **통화 쌍**: USD/KRW
- **테스트 URL**:
  ```
  https://v6.exchangerate-api.com/v6/YOUR_API_KEY/pair/USD/KRW
  ```

---

## 4. 환경 변수 설정

### 4.1 .env.local 파일 수정

프로젝트 루트에 있는 `.env.local` 파일을 열고 발급받은 API 키를 입력하세요:

```env
# ECOS (한국은행 경제통계시스템)
ECOS_API_KEY=여기에_ECOS_API_키_입력

# FRED (Federal Reserve Economic Data)
FRED_API_KEY=여기에_FRED_API_키_입력

# ExchangeRate-API
EXCHANGE_RATE_API_KEY=여기에_ExchangeRate_API_키_입력

# Base Configuration
BASE_DATE=2010-01-01
BASE_RATE=1167
```

### 4.2 예시

```env
# ECOS (한국은행 경제통계시스템)
ECOS_API_KEY=ABC123XYZ456DEF789GHI012JKL345MNO678

# FRED (Federal Reserve Economic Data)
FRED_API_KEY=1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p

# ExchangeRate-API
EXCHANGE_RATE_API_KEY=9f8e7d6c5b4a3210fedc

# Base Configuration
BASE_DATE=2010-01-01
BASE_RATE=1167
```

---

## 5. 실제 데이터 수집 스크립트 작성

### 5.1 fetch-data.ts 생성

`scripts/fetch-data.ts` 파일을 생성하여 실제 API를 호출하는 스크립트를 작성합니다.

```typescript
// scripts/fetch-data.ts
import * as dotenv from 'dotenv'
import { fetchKoreaM2 } from '../lib/api/ecos'
import { fetchUSM2, fetchDXY } from '../lib/api/fred'
import { fetchCurrentRate } from '../lib/api/exchange-rate'

// 환경 변수 로드
dotenv.config({ path: '.env.local' })

async function main() {
  console.log('Fetching real data from APIs...')

  try {
    // 1. 환율 데이터
    const currentRate = await fetchCurrentRate(
      process.env.EXCHANGE_RATE_API_KEY!
    )
    console.log('✓ Exchange rate fetched:', currentRate)

    // 2. 한국 M2
    const krM2 = await fetchKoreaM2(
      process.env.ECOS_API_KEY!,
      '201001', // 시작: 2010년 1월
      '202512'  // 종료: 2025년 12월
    )
    console.log('✓ Korea M2 fetched:', krM2.length, 'data points')

    // 3. 미국 M2
    const usM2 = await fetchUSM2(
      process.env.FRED_API_KEY!,
      '2010-01-01',
      '2025-12-31'
    )
    console.log('✓ US M2 fetched:', usM2.length, 'data points')

    // 4. 달러 인덱스
    const dxy = await fetchDXY(
      process.env.FRED_API_KEY!,
      '2010-01-01',
      '2025-12-31'
    )
    console.log('✓ DXY fetched:', dxy.length, 'data points')

    // 5. 데이터 처리 및 저장
    // ... (processRawData 함수 사용)

  } catch (error) {
    console.error('Error fetching data:', error)
    process.exit(1)
  }
}

main()
```

### 5.2 dotenv 패키지 설치

```bash
npm install dotenv
```

### 5.3 스크립트 실행

```bash
npm run fetch:data
```

---

## 6. 데이터 업데이트 자동화 (GitHub Actions)

### 6.1 GitHub Secrets 설정

1. GitHub 저장소로 이동
2. Settings → Secrets and variables → Actions
3. "New repository secret" 클릭
4. 다음 3개의 시크릿 추가:
   - `ECOS_API_KEY`
   - `FRED_API_KEY`
   - `EXCHANGE_RATE_API_KEY`

### 6.2 GitHub Actions 워크플로우

`.github/workflows/update-data.yml` 파일 생성:

```yaml
name: Update KRW Data

on:
  schedule:
    # 매일 오전 9시 (KST) = UTC 00:00
    - cron: '0 0 * * *'
  workflow_dispatch: # 수동 실행 가능

jobs:
  update-data:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Fetch and process data
        env:
          ECOS_API_KEY: ${{ secrets.ECOS_API_KEY }}
          FRED_API_KEY: ${{ secrets.FRED_API_KEY }}
          EXCHANGE_RATE_API_KEY: ${{ secrets.EXCHANGE_RATE_API_KEY }}
        run: npm run fetch:data

      - name: Commit and push if changed
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add public/data/krw-data.json
          git diff --quiet && git diff --staged --quiet || \
          (git commit -m "Update KRW data [automated]" && git push)
```

---

## 7. 테스트

### 7.1 API 연결 테스트

각 API가 정상적으로 작동하는지 확인:

```bash
# 환율 테스트
curl "https://v6.exchangerate-api.com/v6/YOUR_API_KEY/pair/USD/KRW"

# FRED 테스트
curl "https://api.stlouisfed.org/fred/series/observations?series_id=M2SL&api_key=YOUR_API_KEY&file_type=json&limit=5"

# ECOS 테스트
curl "https://ecos.bok.or.kr/api/StatisticSearch/YOUR_API_KEY/json/kr/1/5/101Y004/M/202301/202312/"
```

### 7.2 데이터 수집 테스트

```bash
npm run fetch:data
```

성공하면 `public/data/krw-data.json` 파일이 실제 데이터로 업데이트됩니다.

---

## 8. 문제 해결

### API 키가 작동하지 않을 때

1. **API 키 재확인**
   - 복사할 때 공백이나 특수문자가 포함되지 않았는지 확인
   - `.env.local` 파일에 따옴표 없이 입력

2. **환경 변수 재로드**
   ```bash
   # 개발 서버 재시작
   npm run dev
   ```

3. **API 제한 확인**
   - ExchangeRate-API: 월 1,500 requests
   - FRED: 무제한 (rate limit 있음)
   - ECOS: 무제한

### CORS 에러가 발생할 때

- 서버 사이드(Node.js 스크립트)에서만 API 호출
- 클라이언트(브라우저)에서 직접 호출 금지

### 데이터가 업데이트되지 않을 때

```bash
# 캐시 삭제 후 재생성
rm -rf .next
npm run build
npm run dev
```

---

## 9. 비용 정보

모든 API가 **완전 무료**입니다:

| API | 무료 제한 | 우리 사용량 |
|-----|----------|-----------|
| ECOS | 무제한 | 월 1회 (M2 업데이트) |
| FRED | 무제한 | 일 1회 |
| ExchangeRate-API | 월 1,500 requests | 월 30회 (일 1회) |

**총 비용: $0 / 월** ✅

---

## 10. 다음 단계

API 연결이 완료되면:

1. ✅ 실제 데이터로 차트 확인
2. ✅ 투자 제안이 실시간 데이터 기반으로 표시
3. ✅ GitHub Actions로 자동 업데이트 설정
4. ✅ Vercel에 배포

API 설정에 문제가 있으면 Issues 탭에 문의해주세요!
