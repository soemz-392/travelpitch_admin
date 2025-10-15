const admin = require('firebase-admin');

// Firebase Admin 초기화
const serviceAccount = {
  type: "service_account",
  project_id: "influencer-admin-2a44b",
  private_key_id: "bd19f007b1362036303b1266d8894c43496d43a8",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCvdzbWOfRUvFvE\nyhoEhwM1jnpoLzB/C2tvlonXtDRFLHwX3tVu7mm+4uamxVhbmB+sDpIJafcY7QOr\nb7LkPOdoZwZh5ZsspReqrGE3hmNbGSXVb0UQnUOoRP631bhN/usTNSO8YOGs9G2g\n1SzfytDvNJlZyPeA0KBjzOefMCIPI1nCIJjN0ePTX49dpI6lemKLfbYSkZOJu72G\nTr187HTth2Szyzowhv/7EGIipKVzQa+K+Z4ZGRBsFPO7/e2V61ZxHaOrgEtn11uP\nnDC8WqLYvoesn0NjeGi9U+aJsWiwIrEeqmtfHnEGa2mIDPRbc73mGxwkuSriB9dL\neKpxG1xFAgMBAAECggEADzDNNs00Jazb7gTILVmp8bZIyyHAu1L4BWRdQSco+k8g\nXCmuxSiPT5cRvGDr5hwcq9bkFjwOCCKm1W35aRCLwSpgL1QDM+GEE8LSNM4l5mJe\nN+Tm8AoJbDUy7yPpzZjS7aoFUr75crGDly+1b5d9sKPXXeJL6SNGq3U3HT07yZ8T\nZjqf1+74uCSoLHY9Luf7xVsaDPdMexIS9sCmFlNiWrOPURJ9bUBofQXk2gwimb5x\n8pNZHTMY+Ykf4yKd91mtccuA2h0fzN1om7trr4PYLjLEbOTg9xgyw4SNz7HYSX2R\nylyDEdhWOtmxICSS4mFLb8xb7kV3/V9rrVro2dfnIQKBgQDZF9zjrP5g7iTYLLSx\nckzeOYup04mq8oGiPK3g1udEnV5bPrVj+SI8FMHKuKQPSNNl90c0QDNzOugZN5ME\n4hcS3u/PP6OvivtJD0wuocgszfH28aXM4somKHPnVtDnDOs/7Can/uTT6jqW97rQ\nixUbCGYbSOZOwVROsOZvGYxB5QKBgQDO6X/K/H2HMv/Xl+HhrsydEH5JBRec3NJ8\nnpK2dJ11+YLWGtHuXgYakS6Yf+W7xHreBWLbtKIm0ym+aDHfZd3Q7BJj4BSybFrI\nK7vQp7TSjxfuz0mOsC9McRpeDW56PswLMftvne5T1oR/r4YPgxInmARb9iT9Ov/C\n/9EWBxCK4QKBgAecuJgbJshLUWtrFeLq+RsJtYX87uTZoAYKTqaFopJbWkWky0N4\nJuUobSsokkge65q1sv94CNXPiPfpZPRU4S4+NvZzas/q9ai4Kpmv/o7jocpg6slm\nYmQ4IuhHuQeBAna5Vxmo7Gkp22gTw68wUUsjXkEyqzCzwrsHpOzcXnipAoGAOzdQ\nP4OrWTobRlRNbQ1ducWynqs6asY35zpqupT9S3oxG51pX1LBZHEQaMyRrv84OrpH\n5KD5lyrv03J2c3zv0o79ZGAJDFc+U/NQORMGCQyyyMHCR3fc0X+9EBW//HRkaP/Q\n+cy1HIFUQka1k1LrqzEybi8vvtlXwTL9X9R9w4ECgYBwdPDJ21Cs4crEQUYF6Uno\nTB4GpD+DVFF2wbiXGIoBcCaw4Yt2SidmULND4dbN4xSBWFupaKeMx5xxEVajBlA0\nmOt7xURFrRpPxDgsT6kQRT3ZHhxkY8frbEXfXdbEcmrtIOE05GReXN75YtgDB6TG\nD36PNIRlNkJ0qOTRBBvAVg==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@influencer-admin-2a44b.iam.gserviceaccount.com",
  client_id: "110808856254980215155",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40influencer-admin-2a44b.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'influencer-admin-2a44b'
});

const db = admin.firestore();

async function initFirestore() {
  try {
    // 키워드 세트 생성
    await db.collection('keywordSets').doc('test-1').set({
      name: '일본 유심',
      country: 'JP',
      keywords: ['일본', '유심', '여행'],
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
      updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log('키워드 세트가 생성되었습니다.');
  } catch (error) {
    console.error('초기화 실패:', error);
  }
}

initFirestore();




