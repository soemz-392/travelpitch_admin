import { adminDb } from './firebase-admin';
import { CrawlingService } from './crawling';
import { KeywordSet } from '@/types';

export class SchedulerService {
  static async runWeeklyCrawling() {
    try {
      console.log('Starting weekly crawling job...');

      // 활성화된 키워드 세트 조회
      const keywordSetsSnapshot = await adminDb
        .collection('keywordSets')
        .where('isActive', '==', true)
        .get();

      if (keywordSetsSnapshot.empty) {
        console.log('No active keyword sets found');
        return;
      }

      const keywordSets: KeywordSet[] = [];
      keywordSetsSnapshot.forEach((doc: any) => {
        keywordSets.push({ id: doc.id, ...doc.data() } as KeywordSet);
      });

      console.log(`Found ${keywordSets.length} active keyword sets`);

      // 각 키워드 세트에 대해 크롤링 실행
      const crawlingService = new CrawlingService();
      await crawlingService.initialize();

      let totalResults = 0;

      for (const keywordSet of keywordSets) {
        try {
          console.log(`Crawling keyword set: ${keywordSet.name}`);
          
          const results = await crawlingService.crawlGoogleBlogs(keywordSet);
          
          if (results.length > 0) {
            // 결과 저장
            const batch = adminDb.batch();
            results.forEach(result => {
              const docRef = adminDb.collection('crawlResults').doc();
              batch.set(docRef, {
                ...result,
                keywordSetId: keywordSet.id,
                capturedAt: new Date(),
              });
            });
            
            await batch.commit();
            totalResults += results.length;
            
            console.log(`Saved ${results.length} results for keyword set: ${keywordSet.name}`);
          }
        } catch (error) {
          console.error(`Error crawling keyword set ${keywordSet.name}:`, error);
        }
      }

      await crawlingService.close();

      console.log(`Weekly crawling completed. Total results: ${totalResults}`);

      // 작업 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'weekly_crawling',
        status: 'completed',
        resultsCount: totalResults,
        keywordSetsCount: keywordSets.length,
        startedAt: new Date(),
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Weekly crawling job failed:', error);
      
      // 에러 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'weekly_crawling',
        status: 'failed',
         error: error instanceof Error ? error.message : 'Unknown error',
        startedAt: new Date(),
        failedAt: new Date(),
      });

      throw error;
    }
  }

  static async sendWeeklyReminder() {
    try {
      console.log('Sending weekly reminder...');

      // 통계 데이터 수집
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 신규 크롤링 결과
      const newCrawlResultsSnapshot = await adminDb
        .collection('crawlResults')
        .where('capturedAt', '>=', oneWeekAgo)
        .get();

      // 신규 설문 제출
      const newSurveySubmissionsSnapshot = await adminDb
        .collection('surveySubmissions')
        .where('createdAt', '>=', oneWeekAgo)
        .get();

      // 미발송 건수
      const pendingDispatchesSnapshot = await adminDb
        .collection('dispatchBatches')
        .where('status', 'in', ['ready', 'downloaded'])
        .get();

      const stats = {
        newCrawlResults: newCrawlResultsSnapshot.size,
        newSurveySubmissions: newSurveySubmissionsSnapshot.size,
        pendingDispatches: pendingDispatchesSnapshot.size,
      };

      console.log('Weekly stats:', stats);

      // Slack 알림 발송 (실제 구현에서는 Slack webhook 사용)
      if (process.env.SLACK_WEBHOOK_URL) {
        const message = {
          text: `주간 인플루언서 관리 현황`,
          attachments: [
            {
              color: 'good',
              fields: [
                {
                  title: '신규 크롤링 결과',
                  value: `${stats.newCrawlResults}건`,
                  short: true,
                },
                {
                  title: '신규 설문 제출',
                  value: `${stats.newSurveySubmissions}건`,
                  short: true,
                },
                {
                  title: '미발송 건수',
                  value: `${stats.pendingDispatches}건`,
                  short: true,
                },
              ],
            },
          ],
        };

        // Slack webhook 호출 (실제 구현)
        // await fetch(process.env.SLACK_WEBHOOK_URL, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(message),
        // });
      }

      // 작업 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'weekly_reminder',
        status: 'completed',
        stats,
        sentAt: new Date(),
      });

    } catch (error) {
      console.error('Weekly reminder failed:', error);
      
      // 에러 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'weekly_reminder',
        status: 'failed',
         error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date(),
      });

      throw error;
    }
  }

  static async cleanupOldData() {
    try {
      console.log('Starting data cleanup...');

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // 오래된 크롤링 결과 삭제
      const oldCrawlResultsSnapshot = await adminDb
        .collection('crawlResults')
        .where('capturedAt', '<', threeMonthsAgo)
        .get();

      if (!oldCrawlResultsSnapshot.empty) {
        const batch = adminDb.batch();
        oldCrawlResultsSnapshot.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Deleted ${oldCrawlResultsSnapshot.size} old crawl results`);
      }

      // 오래된 작업 로그 삭제
      const oldJobLogsSnapshot = await adminDb
        .collection('jobLogs')
        .where('startedAt', '<', threeMonthsAgo)
        .get();

      if (!oldJobLogsSnapshot.empty) {
        const batch = adminDb.batch();
        oldJobLogsSnapshot.forEach((doc: any) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`Deleted ${oldJobLogsSnapshot.size} old job logs`);
      }

      // 작업 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'data_cleanup',
        status: 'completed',
        deletedCrawlResults: oldCrawlResultsSnapshot.size,
        deletedJobLogs: oldJobLogsSnapshot.size,
        completedAt: new Date(),
      });

    } catch (error) {
      console.error('Data cleanup failed:', error);
      
      // 에러 로그 저장
      await adminDb.collection('jobLogs').add({
        jobType: 'data_cleanup',
        status: 'failed',
         error: error instanceof Error ? error.message : 'Unknown error',
        failedAt: new Date(),
      });

      throw error;
    }
  }
}

