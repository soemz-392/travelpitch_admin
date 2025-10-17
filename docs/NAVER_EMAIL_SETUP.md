# 네이버 메일 연동 가이드

네이버 메일을 사용하여 이메일을 발송하는 방법을 안내합니다.

## 📋 사전 준비

### 1. 네이버 IMAP/SMTP 사용 설정

1. [네이버 메일](https://mail.naver.com) 로그인
2. 우측 상단 **환경설정** (⚙️) 클릭
3. **POP3/IMAP 설정** 메뉴 선택
4. **IMAP/SMTP 사용** 체크박스 활성화
5. **확인** 버튼 클릭

### 2. 앱 비밀번호 발급 (2단계 인증 사용 시)

네이버 계정에서 2단계 인증을 사용 중이라면 **앱 비밀번호**를 발급받아야 합니다.

1. [네이버 내정보](https://nid.naver.com/user2/help/myInfo?menu=home) 접속
2. **보안설정** 메뉴
3. **2단계 인증** → **앱 비밀번호 관리**
4. **새 앱 비밀번호 생성**
   - 앱 이름: `influencer-admin` (원하는 이름)
   - 생성된 비밀번호 복사 (한 번만 표시됨!)

> ⚠️ **중요**: 2단계 인증을 사용하지 않는 경우 일반 네이버 비밀번호를 사용할 수 있지만, 보안을 위해 앱 비밀번호 사용을 권장합니다.

---

## ⚙️ 환경 변수 설정

### 로컬 개발 (.env.local)

`.env.local` 파일을 열고 다음과 같이 설정하세요:

```env
# Email Service Configuration
EMAIL_PROVIDER=naver

# 네이버 메일 설정
NAVER_EMAIL=your-email@naver.com
NAVER_EMAIL_PASSWORD=your-app-password-or-password

# 발신자 이메일 (선택사항, 미설정 시 NAVER_EMAIL 사용)
FROM_EMAIL=your-email@naver.com
```

**설정 예시:**
```env
EMAIL_PROVIDER=naver
NAVER_EMAIL=mycompany@naver.com
NAVER_EMAIL_PASSWORD=abcd1234efgh5678
FROM_EMAIL=mycompany@naver.com
```

### Vercel 배포

Vercel Dashboard에서 환경 변수를 추가하세요:

1. Vercel 프로젝트 페이지
2. **Settings** → **Environment Variables**
3. 다음 변수 추가:
   - `EMAIL_PROVIDER` = `naver`
   - `NAVER_EMAIL` = `your-email@naver.com`
   - `NAVER_EMAIL_PASSWORD` = `your-app-password`
   - `FROM_EMAIL` = `your-email@naver.com` (선택)

---

## 🔧 네이버 SMTP 정보

시스템에서 자동으로 사용하는 설정:

- **호스트**: smtp.naver.com
- **포트**: 465 (SSL)
- **보안**: SSL/TLS 필수
- **인증**: 네이버 이메일 + 앱 비밀번호

---

## ✅ 테스트

### 1. 로컬에서 테스트

```bash
npm run dev
```

1. `http://localhost:3000/email` 접속
2. 캠페인 생성
3. 테스트 이메일 주소 입력
4. 발송 버튼 클릭
5. 이메일 수신 확인

### 2. 문제 해결

**이메일이 발송되지 않는 경우:**

1. ✅ IMAP/SMTP 사용 설정 확인
2. ✅ 환경 변수 올바르게 설정되었는지 확인
3. ✅ 2단계 인증 사용 시 앱 비밀번호 사용
4. ✅ 네이버 메일 주소와 비밀번호 정확한지 확인
5. ✅ 개발 서버 재시작

**오류 로그 확인:**
```bash
# 브라우저 콘솔에서 확인
# 또는 터미널에서 서버 로그 확인
```

---

## 📊 발송 제한

네이버 메일 SMTP 사용 시 제한사항:

- **일일 발송 제한**: 약 500통/일 (네이버 정책에 따라 변동)
- **시간당 발송 제한**: 약 50통/시간
- **스팸 신고 주의**: 과도한 발송 시 계정 제한 가능

> 💡 **팁**: 대량 발송이 필요한 경우 SendGrid 또는 AWS SES 사용을 권장합니다.

---

## 🔄 다른 이메일 서비스로 전환

### SendGrid 사용

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@yourdomain.com
```

### AWS SES 사용

```env
EMAIL_PROVIDER=ses
SES_REGION=us-east-1
SES_ACCESS_KEY_ID=your-access-key
SES_SECRET_ACCESS_KEY=your-secret-key
FROM_EMAIL=noreply@yourdomain.com
```

---

## 📞 지원

문제가 해결되지 않으면:
1. GitHub Issues에 문의
2. 네이버 고객센터 문의 (메일 관련)
3. 시스템 로그 확인

---

**✨ 설정이 완료되었습니다!**

이제 네이버 메일로 이메일을 발송할 수 있습니다.

