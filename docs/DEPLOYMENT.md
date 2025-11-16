# Vercel 배포 가이드 (Deployment Guide)

## 목차
1. [배포 전 체크리스트](#배포-전-체크리스트)
2. [Vercel 프로젝트 생성](#vercel-프로젝트-생성)
3. [환경 변수 설정](#환경-변수-설정)
4. [배포 실행](#배포-실행)
5. [커스텀 도메인 설정](#커스텀-도메인-설정-선택)
6. [트러블슈팅](#트러블슈팅)

---

## 배포 전 체크리스트

### 1. 로컬 빌드 테스트
```bash
npm run build
npm run start
```
- ✅ 빌드 에러 없이 완료되는지 확인
- ✅ `http://localhost:3000`에서 정상 동작 확인

### 2. 환경 변수 확인
- ✅ `.env.local` 파일에 모든 API 키 설정 확인
- ✅ `.env.example` 파일과 비교하여 누락된 변수 없는지 확인

### 3. Git 상태 확인
```bash
git status
git log --oneline -5
```
- ✅ 모든 변경사항이 커밋되었는지 확인
- ✅ GitHub에 push되었는지 확인

---

## Vercel 프로젝트 생성

### 방법 1: Vercel CLI (권장)

#### 1.1 Vercel CLI 설치
```bash
npm install -g vercel
```

#### 1.2 Vercel 로그인
```bash
vercel login
```
- 이메일 또는 GitHub 계정으로 로그인

#### 1.3 프로젝트 초기화
```bash
vercel
```
- 프로젝트 설정 확인:
  - `Set up and deploy "~/Documents/01.Projects/Won_Evaluation"?` → **Yes**
  - `Which scope do you want to deploy to?` → 본인 계정 선택
  - `Link to existing project?` → **No** (첫 배포 시)
  - `What's your project's name?` → `krw-real-value-tracker`
  - `In which directory is your code located?` → `./` (Enter)
  - `Want to modify these settings?` → **No**

### 방법 2: Vercel 웹 대시보드

#### 2.1 Vercel 웹사이트 접속
1. https://vercel.com/dashboard 접속
2. **Add New** → **Project** 클릭

#### 2.2 Git Repository 연결
1. **Import Git Repository** 섹션에서 GitHub 계정 연결
2. `krw-real-value-tracker` repository 선택
3. **Import** 클릭

#### 2.3 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 설정)
- **Output Directory**: `.next` (자동 설정)
- **Install Command**: `npm install` (자동 설정)

---

## 환경 변수 설정

### 필수 환경 변수 목록

Vercel 대시보드 또는 CLI를 통해 다음 환경 변수를 설정해야 합니다:

| 변수명 | 설명 | 필수 | 예시 |
|--------|------|------|------|
| `ECOS_API_KEY` | 한국은행 ECOS API 키 | ✅ | `123456789ABCDEFG` |
| `FRED_API_KEY` | FRED API 키 | ✅ | `abcdef1234567890abcdef1234567890` |
| `EXCHANGERATE_API_KEY` | ExchangeRate-API 키 | ✅ | `a1b2c3d4e5f6g7h8i9j0` |

### 방법 1: Vercel CLI로 설정

```bash
# Production 환경 변수 설정
vercel env add ECOS_API_KEY production
vercel env add FRED_API_KEY production
vercel env add EXCHANGERATE_API_KEY production

# Preview 환경 변수 설정 (선택)
vercel env add ECOS_API_KEY preview
vercel env add FRED_API_KEY preview
vercel env add EXCHANGERATE_API_KEY preview

# Development 환경 변수 설정 (선택)
vercel env add ECOS_API_KEY development
vercel env add FRED_API_KEY development
vercel env add EXCHANGERATE_API_KEY development
```

### 방법 2: Vercel 웹 대시보드로 설정

1. Vercel 프로젝트 대시보드에서 **Settings** → **Environment Variables** 이동
2. 각 변수 추가:
   - **Key**: 변수명 (예: `ECOS_API_KEY`)
   - **Value**: 실제 API 키 값
   - **Environment**: Production 선택 (또는 All 선택)
3. **Save** 클릭

### API 키 발급 방법

#### 1. ECOS API 키
1. https://ecos.bok.or.kr 접속
2. 회원가입 및 로그인
3. **인증키 신청/조회** → **인증키 신청**
4. API 키 발급 후 복사

#### 2. FRED API 키
1. https://fred.stlouisfed.org/ 접속
2. 회원가입 및 로그인
3. **My Account** → **API Keys** → **Request API Key**
4. API 키 발급 후 복사

#### 3. ExchangeRate-API 키
1. https://www.exchangerate-api.com/ 접속
2. 이메일 입력 후 **Get Free Key** 클릭
3. 이메일로 전송된 API 키 확인

---

## 배포 실행

### CLI로 프로덕션 배포
```bash
# 프로덕션 배포 (자동으로 도메인 할당)
vercel --prod
```

배포 완료 후 출력 예시:
```
✓ Production: https://krw-real-value-tracker.vercel.app [copied to clipboard] [1m 23s]
```

### GitHub 연동 자동 배포 (권장)

Vercel 웹 대시보드에서 GitHub repository를 연결하면:
- ✅ **main** 브랜치에 push할 때마다 **자동 프로덕션 배포**
- ✅ Pull Request 생성 시 **자동 Preview 배포**
- ✅ 배포 상태를 GitHub PR에 자동 표시

#### 자동 배포 활성화 방법
1. Vercel 프로젝트 Settings → **Git** 탭
2. **GitHub Integration** 확인 (이미 연결되어 있음)
3. **Production Branch**: `main` 확인

---

## 커스텀 도메인 설정 (선택)

### 1. 도메인 추가
1. Vercel 프로젝트 대시보드 → **Settings** → **Domains**
2. **Add** 클릭 → 도메인 입력 (예: `krw-tracker.com`)
3. DNS 레코드 설정 안내 확인

### 2. DNS 설정 (도메인 제공업체에서 설정)

**A Record:**
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME Record (www):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 3. SSL 인증서
- Vercel이 자동으로 Let's Encrypt SSL 인증서 발급
- 설정 완료 후 HTTPS 자동 활성화

---

## 배포 후 확인사항

### 1. 배포 URL 접속
```
https://krw-real-value-tracker.vercel.app
```

### 2. 기능 검증
- ✅ 메인 차트가 정상적으로 로드되는지 확인
- ✅ 핵심 지표 요약 카드가 표시되는지 확인
- ✅ 투자 환경 종합 진단 섹션이 작동하는지 확인
- ✅ 모바일 반응형이 정상 작동하는지 확인

### 3. 데이터 확인
- ✅ 최신 데이터가 표시되는지 확인
- ✅ M2 괴리율이 정확히 계산되는지 확인
- ✅ 모든 조건 메시지가 올바르게 표시되는지 확인

---

## 트러블슈팅

### 문제 1: 빌드 실패 (Build Failed)

**증상:**
```
Error: Command "npm run build" exited with 1
```

**해결 방법:**
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. 에러 메시지 확인 및 수정
3. Git commit & push
4. Vercel이 자동으로 재배포

### 문제 2: 환경 변수 누락

**증상:**
- 데이터가 로드되지 않음
- API 에러 발생

**해결 방법:**
1. Vercel 대시보드 → **Settings** → **Environment Variables** 확인
2. 누락된 변수 추가
3. **Deployments** → 최신 배포 → **Redeploy** 클릭

### 문제 3: 404 Not Found

**증상:**
- 페이지가 로드되지 않음

**해결 방법:**
1. `next.config.js` 확인:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     // 설정 확인
   }
   module.exports = nextConfig
   ```
2. `app/page.tsx`가 존재하는지 확인
3. Git commit & push

### 문제 4: 정적 파일 로드 실패

**증상:**
- `public/data/krw-data.json`이 로드되지 않음

**해결 방법:**
1. `public` 폴더가 Git에 포함되어 있는지 확인:
   ```bash
   git ls-files public/
   ```
2. `.gitignore`에 `public/data/`가 제외되지 않았는지 확인
3. 파일이 없으면 추가:
   ```bash
   git add public/data/krw-data.json
   git commit -m "Add static data"
   git push
   ```

---

## 배포 최적화 팁

### 1. 이미지 최적화
- Next.js의 `<Image>` 컴포넌트 사용
- Vercel이 자동으로 이미지 최적화 적용

### 2. Analytics 추가 (선택)
1. Vercel 프로젝트 대시보드 → **Analytics** 탭
2. **Enable Analytics** 클릭
3. 방문자 통계, 성능 메트릭 확인 가능

### 3. 성능 모니터링
- Vercel 대시보드에서 **Web Vitals** 자동 수집
- Core Web Vitals (LCP, FID, CLS) 모니터링

---

## 배포 체크리스트

### 배포 전
- [ ] 로컬 빌드 테스트 완료
- [ ] 모든 기능 정상 작동 확인
- [ ] 환경 변수 준비 완료
- [ ] Git commit & push 완료

### 배포 중
- [ ] Vercel 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] GitHub 연동 완료

### 배포 후
- [ ] 배포 URL 접속 확인
- [ ] 모든 기능 정상 작동 확인
- [ ] 모바일 반응형 확인
- [ ] 데이터 정확성 확인

---

## 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel CLI 문서](https://vercel.com/docs/cli)
- [환경 변수 설정 가이드](https://vercel.com/docs/concepts/projects/environment-variables)

---

**생성일**: 2025-11-16
**버전**: v2.5.1
**작성**: Claude Code
