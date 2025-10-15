#!/bin/bash

# 인플루언서 관리 어드민 시스템 배포 스크립트

set -e

echo "🚀 인플루언서 관리 어드민 시스템 배포를 시작합니다..."

# 환경 변수 확인
if [ -z "$PROJECT_ID" ]; then
    echo "❌ PROJECT_ID 환경 변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$COMMIT_SHA" ]; then
    echo "❌ COMMIT_SHA 환경 변수가 설정되지 않았습니다."
    exit 1
fi

echo "📦 프로젝트 ID: $PROJECT_ID"
echo "📦 커밋 SHA: $COMMIT_SHA"

# Cloud Build 실행
echo "🔨 Cloud Build를 실행합니다..."
gcloud builds submit --config cloudbuild.yaml --substitutions COMMIT_SHA=$COMMIT_SHA

# Cloud Scheduler 작업 설정
echo "⏰ Cloud Scheduler 작업을 설정합니다..."

# 주간 크롤링 작업
gcloud scheduler jobs create http weekly-crawling \
    --schedule="0 0 * * 1" \
    --uri="https://influencer-admin-$COMMIT_SHA-uc.a.run.app/api/scheduler/weekly-crawling" \
    --http-method=POST \
    --headers="Authorization=Bearer $SCHEDULER_TOKEN" \
    --time-zone="Asia/Seoul" \
    --description="주간 크롤링 작업" \
    --location="asia-northeast1" \
    --project=$PROJECT_ID || echo "주간 크롤링 작업이 이미 존재합니다."

# 주간 리마인더 작업
gcloud scheduler jobs create http weekly-reminder \
    --schedule="0 9 * * 1" \
    --uri="https://influencer-admin-$COMMIT_SHA-uc.a.run.app/api/scheduler/weekly-reminder" \
    --http-method=POST \
    --headers="Authorization=Bearer $SCHEDULER_TOKEN" \
    --time-zone="Asia/Seoul" \
    --description="주간 리마인더 작업" \
    --location="asia-northeast1" \
    --project=$PROJECT_ID || echo "주간 리마인더 작업이 이미 존재합니다."

# 데이터 정리 작업
gcloud scheduler jobs create http data-cleanup \
    --schedule="0 2 1 * *" \
    --uri="https://influencer-admin-$COMMIT_SHA-uc.a.run.app/api/scheduler/cleanup" \
    --http-method=POST \
    --headers="Authorization=Bearer $SCHEDULER_TOKEN" \
    --time-zone="Asia/Seoul" \
    --description="월간 데이터 정리 작업" \
    --location="asia-northeast1" \
    --project=$PROJECT_ID || echo "데이터 정리 작업이 이미 존재합니다."

echo "✅ 배포가 완료되었습니다!"
echo "🌐 서비스 URL: https://influencer-admin-$COMMIT_SHA-uc.a.run.app"
echo "📊 Cloud Console: https://console.cloud.google.com/run/detail/asia-northeast1/influencer-admin-$COMMIT_SHA/metrics?project=$PROJECT_ID"





