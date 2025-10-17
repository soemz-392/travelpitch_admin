const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin SDK 초기화
const serviceAccountPath = path.join(__dirname, '../service-account-key.json');

if (!admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
    console.log('\n💡 환경 변수를 사용하여 초기화를 시도합니다...');
    
    // 환경 변수로 초기화 시도
    require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
    
    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
      console.error('❌ Firebase Admin 환경 변수가 설정되지 않았습니다.');
      console.log('\n다음 중 하나를 선택하세요:');
      console.log('1. service-account-key.json 파일 생성');
      console.log('2. .env.local에 Firebase Admin 환경 변수 설정');
      process.exit(1);
    }
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID
    });
    console.log('✅ Firebase Admin initialized with environment variables');
  }
}

const db = admin.firestore();

// 초기 이메일 템플릿 데이터
const emailTemplates = [
  {
    name: '제휴 제안 템플릿',
    subject: '[제휴 제안] {name}님, 해외 여행 유심 서비스 제안드립니다',
    body: `안녕하세요 {name}님,

블로그 "{blogName}"을 통해 귀하를 알게 되었습니다.

귀하의 훌륭한 콘텐츠를 보고, 해외 여행 유심 서비스 제휴를 제안드립니다.

【제휴 혜택】
✅ 무료 해외 여행 유심 제공
✅ 제휴 수수료 지급
✅ 마케팅 지원

자세한 내용은 아래 설문을 통해 신청해주세요.

👉 설문 참여: {surveyUrl}

문의사항이 있으시면 언제든지 연락주세요.

감사합니다.`,
    type: 'proposal',
    variables: ['name', 'blogName', 'surveyUrl'],
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  },
  {
    name: '마케팅 링크 안내 템플릿',
    subject: '[링크 안내] {name}님, 마케팅 링크를 안내드립니다',
    body: `안녕하세요 {name}님,

상품 발송이 완료되었습니다. 아래 링크를 통해 마케팅 활동을 진행해 주세요.

【마케팅 링크】
{trackingLink}

【활동 가이드】
✅ 위 링크를 통해 상품을 소개해 주세요
✅ 사용 후기를 블로그에 포스팅해 주세요
✅ 광고성 표기 문구를 포함해 주세요
   (예: "본 포스팅은 업체로부터 제품을 제공받아 작성되었습니다")

문의사항이 있으시면 언제든지 연락주세요.

감사합니다.`,
    type: 'link',
    variables: ['name', 'trackingLink'],
    isActive: true,
    createdAt: admin.firestore.Timestamp.now(),
    updatedAt: admin.firestore.Timestamp.now(),
  }
];

// 초기 상품 매핑 데이터
const productMappings = [
  {
    country: 'JP',
    simType: 'esim',
    planName: 'KDDI 7일',
    days: 7,
    sellerProductCode: 'ESAZB-JPKD007D_003GD',
  },
  {
    country: 'JP',
    simType: 'esim',
    planName: 'KDDI 10일',
    days: 10,
    sellerProductCode: 'ESAZB-JPKD010D_003GD',
  },
  {
    country: 'TW',
    simType: 'esim',
    planName: 'Chunghwa 5일',
    days: 5,
    sellerProductCode: 'ESAZB-TWCH005D_003GD',
  },
  {
    country: 'TW',
    simType: 'esim',
    planName: 'Chunghwa 7일',
    days: 7,
    sellerProductCode: 'ESAZB-TWCH007D_003GD',
  },
];

async function initEmailData() {
  try {
    console.log('\n🚀 이메일 기능 초기 데이터 생성 시작...\n');

    // 이메일 템플릿 생성
    console.log('📧 이메일 템플릿 생성 중...');
    for (const template of emailTemplates) {
      const docRef = await db.collection('emailTemplates').add(template);
      console.log(`  ✅ 템플릿 생성 완료: ${template.name} (${docRef.id})`);
    }

    // 상품 매핑 생성
    console.log('\n📦 상품 매핑 생성 중...');
    for (const mapping of productMappings) {
      const docRef = await db.collection('productMappings').add(mapping);
      console.log(`  ✅ 매핑 생성 완료: ${mapping.country} - ${mapping.planName} (${docRef.id})`);
    }

    console.log('\n✨ 초기 데이터 생성 완료!\n');
    console.log('다음 단계:');
    console.log('1. 이메일 발송 서비스 설정 (SendGrid 또는 AWS SES)');
    console.log('2. 환경 변수에 이메일 제공자 API 키 추가');
    console.log('   - SENDGRID_API_KEY 또는');
    console.log('   - SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY');
    console.log('3. FROM_EMAIL 환경 변수 설정\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 초기 데이터 생성 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
initEmailData();

