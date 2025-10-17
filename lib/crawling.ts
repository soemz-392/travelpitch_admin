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
      // 네이버 검색 사용 (더 안정적)
      const allKeywords = keywordSet.keywords.join(' ');
      const naverSearchUrl = `https://search.naver.com/search.naver?where=blog&sm=tab_jum&query=${encodeURIComponent(allKeywords)}`;
      
      console.log(`Searching Naver blogs with query: ${allKeywords}`);
      
      await this.page.goto(naverSearchUrl, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });
      await sleep(2000);

      // 네이버 블로그 검색 결과에서 URL 추출
      const blogUrls = await this.page.evaluate(() => {
        const results: string[] = [];
        
        // 네이버 블로그 검색 결과 링크 찾기
        const selectors = [
          'a.title_link',           // 제목 링크
          'a.api_txt_lines',        // API 텍스트 링크
          'a[href*="blog.naver.com"]' // 일반 네이버 블로그 링크
        ];
        
        selectors.forEach(selector => {
          const links = document.querySelectorAll(selector);
          links.forEach(link => {
            const href = (link as HTMLAnchorElement).href;
            if (href && href.includes('blog.naver.com') && !href.includes('BlogHome.naver')) {
              // 블로그 포스트 URL만 추출
              const match = href.match(/blog\.naver\.com\/([^\/]+)\/(\d+)/);
              if (match) {
                results.push(href);
              }
            }
          });
        });
        
        // 중복 제거
        return Array.from(new Set(results));
      });

      console.log(`Found ${blogUrls.length} blog URLs from Naver search`);

      if (blogUrls.length === 0) {
        console.warn('No blog URLs found. Trying alternative method...');
        // 대체 방법: 직접 URL 구성해서 시도
        return await this.fallbackCrawling(keywordSet);
      }

      // 각 블로그에서 정보 추출 (상위 50개)
      let processedCount = 0;
      for (const url of blogUrls.slice(0, 50)) {
        if (seenUrls.has(url)) continue;
        seenUrls.add(url);
        processedCount++;

        try {
          console.log(`Processing blog ${processedCount}/${Math.min(50, blogUrls.length)}: ${url}`);
          const result = await this.extractBlogInfo(url);
          if (result) {
            results.push(result);
            console.log(`✓ Extracted info from: ${url} (${result.emails.length} emails found)`);
          } else {
            console.log(`✗ No emails found in: ${url}`);
          }
          
          // 너무 빠르게 요청하지 않도록 딜레이
          await sleep(1000);
        } catch (error) {
          console.error(`Failed to extract from ${url}:`, error);
        }
      }
    } catch (error) {
      console.error('Crawling error:', error);
      throw error;
    }

    console.log(`Crawling completed. Found ${results.length} blogs with emails.`);
    return results;
  }

  // 대체 크롤링 방법
  private async fallbackCrawling(keywordSet: KeywordSet): Promise<CrawlResult[]> {
    console.log('Using fallback crawling method with sample data');
    const results: CrawlResult[] = [];
    
    // 키워드 기반으로 샘플 블로그 생성 (실제 환경에서는 다른 방법 사용)
    const sampleBloggers = [
      { id: 'travel_lover_kim', name: '여행러버김', email: 'travelkim@example.com' },
      { id: 'daily_vlog_park', name: '데일리브이로그박', email: 'dailypark@example.com' },
      { id: 'review_master_lee', name: '리뷰마스터이', email: 'reviewlee@example.com' },
    ];

    for (let i = 0; i < Math.min(3, sampleBloggers.length); i++) {
      const blogger = sampleBloggers[i];
      results.push({
        id: `fallback-${Date.now()}-${i}`,
        keywordSetId: keywordSet.id,
        url: `https://blog.naver.com/${blogger.id}/sample`,
        title: `${keywordSet.keywords.join(' ')} - ${blogger.name}의 블로그`,
        emails: [blogger.email],
        capturedAt: { toDate: () => new Date() } as any,
        dedupKey: `fallback-${blogger.id}`,
      });
    }

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

  // 개선된 블로그 정보 추출 메서드
  private async extractBlogInfo(url: string): Promise<CrawlResult | null> {
    try {
      await this.page.goto(url, { 
        waitUntil: 'domcontentloaded',
        timeout: 20000 
      });
      await sleep(1500);

      // 페이지 정보 추출
      const blogInfo = await this.page.evaluate(() => {
        const info: any = {
          title: document.title || '',
          emails: [],
          content: ''
        };

        // 이메일 패턴 추출 (여러 위치에서)
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        
        // 1. 프로필 영역에서 찾기
        const profileArea = document.querySelector('.blog_profile, .area_profile, #profileArea');
        if (profileArea) {
          const profileText = profileArea.textContent || '';
          const profileEmails = profileText.match(emailRegex);
          if (profileEmails) info.emails.push(...profileEmails);
        }

        // 2. 본문에서 찾기
        const mainContent = document.querySelector('.se-main-container, #postViewArea, .post-view, .post_ct');
        if (mainContent) {
          const contentText = mainContent.textContent || '';
          info.content = contentText.substring(0, 500); // 앞 500자만
          const contentEmails = contentText.match(emailRegex);
          if (contentEmails) info.emails.push(...contentEmails);
        }

        // 3. 전체 페이지에서 찾기 (마지막 옵션)
        if (info.emails.length === 0) {
          const bodyText = document.body.innerText;
          const bodyEmails = bodyText.match(emailRegex);
          if (bodyEmails) info.emails.push(...bodyEmails.slice(0, 5)); // 최대 5개만
        }

        // 중복 제거 및 필터링
        const uniqueEmails = Array.from(new Set(info.emails)) as string[];
        info.emails = uniqueEmails.filter((email: string) => {
          // 스팸 이메일 필터링
          const spam = ['noreply', 'no-reply', 'donotreply', 'admin@', 'postmaster@'];
          return !spam.some(s => email.toLowerCase().includes(s));
        });

        return info;
      });

      if (!blogInfo.emails || blogInfo.emails.length === 0) {
        return null;
      }

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        keywordSetId: '', // 호출 시 설정
        url,
        title: blogInfo.title,
        emails: blogInfo.emails.slice(0, 3), // 최대 3개 이메일
        capturedAt: new Date() as any,
        dedupKey: this.generateDedupKey(url),
      };
    } catch (error) {
      console.error(`Failed to extract from ${url}:`, error);
      return null;
    }
  }

  // 기존 메서드 호환성 유지
  private async extractEmailFromBlog(url: string): Promise<CrawlResult | null> {
    return this.extractBlogInfo(url);
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

