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
    if (!this.page) {
      await this.initialize();
    }

    console.log(`Starting crawl for keyword set: ${keywordSet.name}`);

    const results: CrawlResult[] = [];
    const seenUrls = new Set<string>();

    try {
      for (const keyword of keywordSet.keywords) {
        // 구글 검색으로 네이버 블로그 찾기
        const searchQuery = `site:blog.naver.com ${keyword}`;
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}&num=20`;
        
        await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
        await sleep(3000);

        // 블로그 URL 추출
        const blogUrls = await this.page.evaluate(() => {
          const links = document.querySelectorAll('a[href*="blog.naver.com"]');
          return Array.from(links).map(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('/url?q=')) {
              // 구글 검색 결과에서 실제 URL 추출
              const urlMatch = href.match(/\/url\?q=([^&]+)/);
              return urlMatch ? decodeURIComponent(urlMatch[1]) : href;
            }
            return href;
          }).filter(url => url && url.includes('blog.naver.com'));
        });

        // 각 블로그에서 이메일 추출
        for (const url of blogUrls.slice(0, 10)) { // 상위 10개만 처리
          if (seenUrls.has(url)) continue;
          seenUrls.add(url);

          try {
            const result = await this.extractEmailFromBlog(url);
            if (result) {
              results.push(result);
            }
          } catch (error) {
            console.error(`Failed to extract email from ${url}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    }

    console.log(`Crawling completed. Found ${results.length} results.`);
    return results;
  }

  private getSampleResults(keywordSet: KeywordSet): CrawlResult[] {
    const sampleEmails = [
      'traveler@example.com',
      'blogger@naver.com',
      'influencer@test.com',
      'user123@email.com',
      'contact@blog.com'
    ];

    return keywordSet.keywords.slice(0, 3).map((keyword, index) => ({
      id: `sample-${Date.now()}-${index}`,
      keywordSetId: keywordSet.id,
      url: `https://blog.naver.com/sample${index + 1}/123456789`,
      title: `${keyword} 관련 블로그 포스트 ${index + 1}`,
      emails: [sampleEmails[index % sampleEmails.length]],
      capturedAt: { toDate: () => new Date() } as any,
      dedupKey: `sample-${keyword}-${index}`,
    }));
  }

  private async extractEmailFromBlog(url: string): Promise<CrawlResult | null> {
    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await sleep(1000);

      // 페이지 제목 추출
      const title = await this.page.title();

      // 이메일 패턴 추출
      const emails = await this.page.evaluate(() => {
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const text = document.body.innerText;
        const matches = text.match(emailRegex);
         return matches ? Array.from(new Set(matches)) : [];
      });

      if (emails.length === 0) {
        return null;
      }

      // 우선순위에 따라 이메일 정렬 (프로필 > 소개 > 본문)
      const sortedEmails = await this.prioritizeEmails(emails);

      return {
        id: Date.now().toString(),
        keywordSetId: '', // 호출 시 설정
        url,
        title,
        emails: sortedEmails,
        capturedAt: new Date() as any,
        dedupKey: this.generateDedupKey(url),
      };
    } catch (error) {
      console.error(`Failed to extract email from ${url}:`, error);
      return null;
    }
  }

  private async prioritizeEmails(emails: string[]): Promise<string[]> {
    // 이메일 우선순위 로직 구현
    // 1. 프로필에서 발견된 이메일
    // 2. 소개에서 발견된 이메일  
    // 3. 본문에서 발견된 이메일
    
    // 현재는 단순히 중복 제거만 수행
     return Array.from(new Set(emails));
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

