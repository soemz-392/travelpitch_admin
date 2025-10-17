# 인플루언서 관리 어드민 시스템

해외/국내 인플루언서 발굴 → 제안 발송 → 설문 수집 → 상품 일괄 발송 → 마케팅 링크 안내를 자동화/반자동화하여 업무 효율과 전환율을 높이는 시스템입니다.

## 주요 기능

### F1. 대시보드
- 신규 크롤링 결과, 설문 제출, 미발송 건수 통계
- 최근 캠페인 및 링크 발송 이력
- 빠른 작업 링크

### F2. 크롤링 관리
- 키워드 세트 관리 (국가별, 키워드별)
- 네이버 블로그 크롤링 실행
- 이메일 추출 및 중복 제거
- 크롤링 결과 관리

### F3. 이메일 발송
- 제휴 제안 메일 템플릿 관리
- 배치 발송 및 레이트 리미팅
- 발송 상태 추적 (queued/sent/open/click/bounce)
- 첨부파일 관리

### F4. 설문 관리
- 인플루언서 설문 제출 현황
- 설문 항목 관리 (이름, 네이버ID, 국가, 이용일수 등)
- 광고성 표기 동의 확인
- 설문 데이터 내보내기

### F5. 발송 관리
- 상품 매핑 테이블 관리
- 자사몰 업로드용 XLS 생성
- 발송 처리 상태 관리
- 엑셀 다운로드 및 처리 완료 체크

### F6. 링크 발송 이력
- 마케팅 링크 발송 현황
- 클릭률 및 성과 추적
- 재발송 기능
- 추적 파라미터 관리

## 기술 스택

- **프론트엔드**: Next.js 15, React, TailwindCSS
- **백엔드**: Firebase (Auth, Firestore, Storage)
- **이메일**: 네이버 메일, SendGrid, 또는 Amazon SES
- **크롤링**: 네이버 검색 API
- **스케줄러**: Cloud Scheduler
- **배포**: Vercel

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone <repository-url>
cd influencer_admin
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
```bash
cp env.example .env.local
```

`.env.local` 파일을 수정하여 Firebase 및 이메일 서비스 설정을 입력하세요.

### 4. 개발 서버 실행
```bash
npm run dev
```

## 환경 변수

### Firebase 설정
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 이메일 서비스 설정

**네이버 메일 (권장, 무료):**
```env
EMAIL_PROVIDER=naver
NAVER_EMAIL=your-email@naver.com
NAVER_EMAIL_PASSWORD=your-app-password
FROM_EMAIL=your-email@naver.com
```
> 📖 **설정 방법**: [네이버 메일 연동 가이드](docs/NAVER_EMAIL_SETUP.md) 참고

**SendGrid (대량 발송):**
```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

**AWS SES (기업용):**
```env
EMAIL_PROVIDER=ses
SES_REGION=us-east-1
SES_ACCESS_KEY_ID=your-ses-access-key
SES_SECRET_ACCESS_KEY=your-ses-secret-key
FROM_EMAIL=noreply@yourdomain.com
```

### 기타 설정
```
EMAIL_RATE_LIMIT_PER_MINUTE=50
EMAIL_RATE_LIMIT_PER_HOUR=1000
CRAWLING_SCHEDULE=0 0 * * 1
NAVER_SEARCH_LIMIT=50
```

## 데이터 모델

### 주요 컬렉션
- `users`: 사용자 정보 및 권한
- `keywordSets`: 크롤링 키워드 세트
- `crawlResults`: 크롤링 결과
- `emailCampaigns`: 이메일 캠페인
- `emailLogs`: 이메일 발송 로그
- `surveySubmissions`: 설문 제출 데이터
- `productMappings`: 상품 매핑 테이블
- `dispatchBatches`: 발송 배치
- `settings`: 시스템 설정

## 배포

### 프론트엔드 (Vercel)
1. Vercel에 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 설정

### 백엔드 (Cloud Run)
1. Dockerfile 생성
2. Cloud Run에 배포
3. 스케줄러 설정

## 사용법

### 1. 초기 설정
1. Firebase 프로젝트 생성
2. Firestore 데이터베이스 생성
3. 사용자 계정 생성 및 권한 설정

### 2. 키워드 세트 생성
1. 크롤링 관리 페이지에서 새 키워드 세트 생성
2. 국가 코드 및 키워드 입력
3. 크롤링 실행

### 3. 이메일 발송
1. 초기 데이터 생성 (최초 1회만)
   ```bash
   npm run init-email
   ```
2. 이메일 템플릿 관리
   - `/email` 페이지에서 템플릿 확인
   - 변수 사용: `{name}`, `{blogName}`, `{surveyUrl}`
3. 캠페인 생성 및 발송
   - 템플릿 선택
   - 수신자 이메일 입력 (쉼표로 구분)
   - 발송 버튼 클릭
4. 발송 로그 확인
   - 발송 성공/실패 상태
   - 열람/클릭 추적

### 4. 설문 관리
1. 설문 제출 현황 확인
2. 발송 대상 선택
3. 엑셀 생성 및 다운로드

### 5. 발송 관리
1. 상품 매핑 설정 (국가 + 일수 → 상품코드)
2. 설문 선택 후 엑셀 생성
3. 자사몰에 업로드
4. 처리 완료 체크

### 6. 링크 추적
1. 발송 완료 후 링크 자동 생성
2. 클릭률 및 성과 모니터링
3. 필요시 재발송

## API 엔드포인트

### 이메일 관련
- `GET /api/email/templates` - 템플릿 목록
- `POST /api/email/templates` - 템플릿 생성
- `GET /api/email/campaigns` - 캠페인 목록
- `POST /api/email/campaigns` - 캠페인 생성
- `PATCH /api/email/campaigns/[id]` - 캠페인 상태 업데이트
- `POST /api/email/send` - 이메일 발송
- `GET /api/email/logs` - 발송 로그 조회

### 설문 관련
- `GET /api/survey-submissions` - 설문 목록
- `POST /api/survey-submissions` - 설문 제출

### 발송 관리
- `GET /api/dispatch/batches` - 배치 목록
- `POST /api/dispatch/excel` - 엑셀 생성
- `GET /api/dispatch/excel?batchId=xxx` - 엑셀 다운로드
- `PATCH /api/dispatch/batches/[id]` - 배치 상태 업데이트

### 상품 매핑
- `GET /api/product-mappings` - 매핑 목록
- `POST /api/product-mappings` - 매핑 생성
- `DELETE /api/product-mappings/[id]` - 매핑 삭제

## 보안 및 컴플라이언스

- HTTPS 강제 사용
- 비밀번호 해시 및 암호화
- 수신거부 링크 포함
- 광고성 표기 문구 포함
- 개인정보 보호 정책 준수
- Firebase Security Rules 적용
- API Rate Limiting

## 문제 해결

### 일반적인 문제
1. **Firebase 연결 오류**: 환경 변수 확인
2. **이메일 발송 실패**: API 키 및 설정 확인
3. **크롤링 실패**: Puppeteer 설정 확인

### 로그 확인
- Cloud Logging에서 에러 로그 확인
- Slack 알림 설정으로 실시간 모니터링

## 라이선스

MIT License

## 기여

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request





