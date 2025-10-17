import { KeywordSet, CrawlResult } from '@/types';

// Vercel 환경 감지
const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === 'production';

// waitForTimeout 대체 헬퍼 함수
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class CrawlingService {
  private browser: any;
  private page: any;

  async initialize() {
    try {
      console.log('Initializing CrawlingService, isVercel:', isVercel);
      
      if (isVercel) {
        // Vercel 환경: puppeteer-core + chromium 사용
        console.log('Using Vercel environment setup');
        const puppeteerCore = await import('puppeteer-core');
        const chromium = await import('@sparticuz/chromium');

        const executablePath = await chromium.default.executablePath();
        console.log('Chromium executablePath:', executablePath);

        this.browser = await puppeteerCore.default.launch({
          args: [...chromium.default.args, '--no-sandbox', '--disable-setuid-sandbox'],
          executablePath,
          headless: true,
        });
      } else {
        // 로컬 환경: 일반 puppeteer 사용
        console.log('Using local environment setup');
        const puppeteer = await import('puppeteer');
        this.browser = await puppeteer.default.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }
      
      console.log('Browser launched successfully');
      this.page = await this.browser.newPage();
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
      console.log('CrawlingService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize CrawlingService:', error);
      throw error;
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawlGoogleBlogs(keywordSet: KeywordSet): Promise<CrawlResult[]> {
    console.log(`Starting crawl for keyword set: ${keywordSet.name}`);
    
    // 네이버 검색 API 사용 (환경 변수에서 키 가져오기)
    const naverClientId = process.env.NAVER_CLIENT_ID;
    const naverClientSecret = process.env.NAVER_CLIENT_SECRET;

    if (naverClientId && naverClientSecret) {
      return await this.crawlUsingNaverAPI(keywordSet, naverClientId, naverClientSecret);
    }

    // API 키가 없으면 수동 입력 안내 메시지와 함께 샘플 결과 반환
    console.warn('⚠️ Naver API credentials not found.');
    console.warn('크롤링은 네이버 API를 사용해야 합니다.');
    console.warn('대신 "인플루언서 관리" 섹션에서 수동으로 추가해주세요.');
    
    return await this.fallbackCrawling(keywordSet);
  }

  // 네이버 검색 API를 사용한 크롤링
  private async crawlUsingNaverAPI(
    keywordSet: KeywordSet, 
    clientId: string, 
    clientSecret: string
  ): Promise<CrawlResult[]> {
    const results: CrawlResult[] = [];
    
    try {
      const allKeywords = keywordSet.keywords.join(' ');
      const apiUrl = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(allKeywords)}&display=50&sort=sim`;
      
      console.log(`Searching Naver blogs via API with query: ${allKeywords}`);

      const response = await fetch(apiUrl, {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      });

      if (!response.ok) {
        console.error('Naver API error:', response.status, response.statusText);
        return await this.fallbackCrawling(keywordSet);
      }

      const data = await response.json();
      console.log(`Found ${data.items?.length || 0} blogs from Naver API`);

      if (!data.items || data.items.length === 0) {
        return await this.fallbackCrawling(keywordSet);
      }

      // API 결과에서 블로그 정보 추출
      for (const item of data.items.slice(0, 50)) {
        // 네이버 블로그만 필터링
        if (item.link && item.link.includes('blog.naver.com')) {
          results.push({
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            keywordSetId: keywordSet.id,
            url: item.link,
            title: this.stripHtmlTags(item.title),
            emails: [], // API로는 이메일을 가져올 수 없음 - 수동 입력 필요
            capturedAt: { toDate: () => new Date() } as any,
            dedupKey: this.generateDedupKey(item.link),
          });
        }
      }

      console.log(`Extracted ${results.length} blog URLs via API`);
      
      if (results.length > 0) {
        console.log('💡 팁: 이메일 정보는 "인플루언서 관리"에서 수동으로 추가하세요.');
      }

      return results;
    } catch (error) {
      console.error('Naver API crawling error:', error);
      return await this.fallbackCrawling(keywordSet);
    }
  }

  // HTML 태그 제거 헬퍼
  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }

  // 대체 크롤링 방법 (API 없을 때)
  private async fallbackCrawling(keywordSet: KeywordSet): Promise<CrawlResult[]> {
    console.log('⚠️ Naver API credentials not configured.');
    console.log('📋 네이버 검색 API 설정 방법:');
    console.log('1. https://developers.naver.com/apps/#/register 접속');
    console.log('2. 애플리케이션 등록 (검색 API 선택)');
    console.log('3. Client ID와 Client Secret 발급');
    console.log('4. 환경 변수에 추가:');
    console.log('   NAVER_CLIENT_ID=발급받은ID');
    console.log('   NAVER_CLIENT_SECRET=발급받은Secret');
    console.log('');
    console.log('💡 또는 "인플루언서 관리" 섹션에서 수동으로 추가하세요!');
    
    // 빈 결과 반환
    return [];
  }


  private generateDedupKey(url: string): string {
    // URL에서 도메인과 경로를 추출하여 중복 키 생성
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }

  // 이메일 유효성 검증
  static validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // 스팸 이메일 필터링
  static filterSpamEmails(emails: string[]): string[] {
    const spamPatterns = [
      /noreply/i,
      /no-reply/i,
      /donotreply/i,
      /admin@/i,
      /info@/i,
      /support@/i,
      /contact@/i,
    ];

    return emails.filter(email => {
      return !spamPatterns.some(pattern => pattern.test(email));
    });
  }
}

