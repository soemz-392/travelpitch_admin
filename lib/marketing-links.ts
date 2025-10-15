import fs from 'fs';
import path from 'path';

// 스마트스토어 마케팅링크 데이터 구조
export interface MarketingLink {
  countryCode: string;
  countryName: string;
  simType: 'usim' | 'esim';
  productName: string;
  baseUrl: string;
  productId: string;
}

// 실제 스마트스토어 CSV 파일에서 마케팅링크 데이터 로드
function loadMarketingLinksFromCSV(): MarketingLink[] {
  try {
    const csvPath = path.join(process.cwd(), 'data', 'marketing-links', 'marketing-links_2.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // 헤더 제거
    const dataLines = lines.slice(1);
    
    return dataLines.map(line => {
      const [category, productId, productName, marketingLink] = line.split(',');
      
      // 상품명에서 국가와 SIM 유형 추출
      const { countryCode, countryName, simType } = extractCountryAndSimType(productName);
      
      return {
        countryCode,
        countryName,
        simType,
        productName: productName.trim(),
        baseUrl: marketingLink.trim(),
        productId: productId.trim(),
      };
    }).filter(link => link.countryCode && link.simType); // 유효한 데이터만 필터링
  } catch (error) {
    console.error('Failed to load marketing links from CSV:', error);
    // CSV 파일이 없거나 읽기 실패 시 기본 데이터 반환
    return getDefaultMarketingLinks();
  }
}

// 상품명에서 국가와 SIM 유형 추출하는 함수
function extractCountryAndSimType(productName: string): { countryCode: string; countryName: string; simType: 'usim' | 'esim' } {
  const name = productName.toLowerCase();
  
  // SIM 유형 추출 (이심/eSIM이 우선)
  let simType: 'usim' | 'esim' = 'esim'; // 기본값
  if (name.includes('이심') || name.includes('esim') || name.includes('e심')) {
    simType = 'esim';
  } else if (name.includes('유심') || name.includes('usim')) {
    simType = 'usim';
  }
  
  // 국가 매핑
  const countryMapping: Record<string, { code: string; name: string }> = {
    '우즈베키스탄': { code: 'UZ', name: '우즈베키스탄' },
    '카자흐스탄': { code: 'KZ', name: '카자흐스탄' },
    '모로코': { code: 'MA', name: '모로코' },
    '이집트': { code: 'EG', name: '이집트' },
    '튀니지': { code: 'TN', name: '튀니지' },
    '탄자니아': { code: 'TZ', name: '탄자니아' },
    '싱가포르': { code: 'SG', name: '싱가포르' },
    '말레이시아': { code: 'MY', name: '말레이시아' },
    '태국': { code: 'TH', name: '태국' },
    '유럽': { code: 'EU', name: '유럽' },
    '영국': { code: 'GB', name: '영국' },
    '괌': { code: 'GU', name: '괌' },
    '로타': { code: 'GU', name: '괌' },
    '티니안': { code: 'GU', name: '괌' },
    '사이판': { code: 'GU', name: '괌' },
    '러시아': { code: 'RU', name: '러시아' },
    '발칸': { code: 'EU', name: '유럽' },
    '동유럽': { code: 'EU', name: '유럽' },
    '몬테네그로': { code: 'ME', name: '몬테네그로' },
    '알바니아': { code: 'AL', name: '알바니아' },
    '벨라루스': { code: 'BY', name: '벨라루스' },
    '사우디': { code: 'SA', name: '사우디아라비아' },
    '두바이': { code: 'AE', name: '아랍에미리트' },
    '터키': { code: 'TR', name: '터키' },
    '요르단': { code: 'JO', name: '요르단' },
    '중동': { code: 'AE', name: '아랍에미리트' },
    '미국': { code: 'US', name: '미국' },
    '하와이': { code: 'US', name: '미국' },
    '뉴욕': { code: 'US', name: '미국' },
    '캐나다': { code: 'CA', name: '캐나다' },
    '토론토': { code: 'CA', name: '캐나다' },
    '밴쿠버': { code: 'CA', name: '캐나다' },
    '일본': { code: 'JP', name: '일본' },
    '후쿠오카': { code: 'JP', name: '일본' },
    '도쿄': { code: 'JP', name: '일본' },
    '오사카': { code: 'JP', name: '일본' },
    '인도네시아': { code: 'ID', name: '인도네시아' },
    '발리': { code: 'ID', name: '인도네시아' },
    '자카르타': { code: 'ID', name: '인도네시아' },
    '한국': { code: 'KR', name: '한국' },
    '라오스': { code: 'LA', name: '라오스' },
    '비엔티안': { code: 'LA', name: '라오스' },
    '루앙프라방': { code: 'LA', name: '라오스' },
    '방비엥': { code: 'LA', name: '라오스' },
    '중국': { code: 'CN', name: '중국' },
    '상하이': { code: 'CN', name: '중국' },
    '베트남': { code: 'VN', name: '베트남' },
    '나트랑': { code: 'VN', name: '베트남' },
    '푸꾸옥': { code: 'VN', name: '베트남' },
    '다낭': { code: 'VN', name: '베트남' },
    '몽골': { code: 'MN', name: '몽골' },
    '울란바토르': { code: 'MN', name: '몽골' },
    '대만': { code: 'TW', name: '대만' },
    '가오슝': { code: 'TW', name: '대만' },
    '타이베이': { code: 'TW', name: '대만' },
    '홍콩': { code: 'HK', name: '홍콩' },
    '마카오': { code: 'HK', name: '홍콩마카오' },
    '호주': { code: 'AU', name: '호주' },
    '브리즈번': { code: 'AU', name: '호주' },
    '시드니': { code: 'AU', name: '호주' },
    '인도': { code: 'IN', name: '인도' },
    '델리': { code: 'IN', name: '인도' },
    '뭄바이': { code: 'IN', name: '인도' },
    '필리핀': { code: 'PH', name: '필리핀' },
    '세부': { code: 'PH', name: '필리핀' },
    '보홀': { code: 'PH', name: '필리핀' },
    '보라카이': { code: 'PH', name: '필리핀' },
    '조지아': { code: 'GE', name: '조지아' },
    '아르메니아': { code: 'AM', name: '아르메니아' },
    '이스라엘': { code: 'IL', name: '이스라엘' },
    '네팔': { code: 'NP', name: '네팔' },
    '부탄': { code: 'BT', name: '부탄' },
    '방글라데시': { code: 'BD', name: '방글라데시' },
    '아부다비': { code: 'AE', name: '아랍에미리트' },
    '카타르': { code: 'QA', name: '카타르' },
    '쿠웨이트': { code: 'KW', name: '쿠웨이트' },
    '멕시코': { code: 'MX', name: '멕시코' },
    '스리랑카': { code: 'LK', name: '스리랑카' },
    '브루나이': { code: 'BN', name: '브루나이' },
    '콜롬비아': { code: 'CO', name: '콜롬비아' },
    '브라질': { code: 'BR', name: '브라질' },
    '칠레': { code: 'CL', name: '칠레' },
    '페루': { code: 'PE', name: '페루' },
    '아르헨티나': { code: 'AR', name: '아르헨티나' },
    '파키스탄': { code: 'PK', name: '파키스탄' },
  };
  
  // 국가 찾기
  let countryCode = 'ETC';
  let countryName = '기타';
  
  for (const [keyword, country] of Object.entries(countryMapping)) {
    if (name.includes(keyword)) {
      countryCode = country.code;
      countryName = country.name;
      break;
    }
  }
  
  return { countryCode, countryName, simType };
}

// 기본 마케팅링크 데이터 (CSV 로드 실패 시 사용)
function getDefaultMarketingLinks(): MarketingLink[] {
  return [
  // 유럽 (EU)
  { countryCode: 'EU', countryName: '유럽', simType: 'usim', productName: '유럽 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'eu-usim' },
  { countryCode: 'EU', countryName: '유럽', simType: 'esim', productName: '유럽 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'eu-esim' },
  
  // 베트남 (VN)
  { countryCode: 'VN', countryName: '베트남', simType: 'usim', productName: '베트남 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'vn-usim' },
  { countryCode: 'VN', countryName: '베트남', simType: 'esim', productName: '베트남 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'vn-esim' },
  
  // 태국 (TH)
  { countryCode: 'TH', countryName: '태국', simType: 'usim', productName: '태국 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'th-usim' },
  { countryCode: 'TH', countryName: '태국', simType: 'esim', productName: '태국 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'th-esim' },
  
  // 일본 (JP)
  { countryCode: 'JP', countryName: '일본', simType: 'usim', productName: '일본 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'jp-usim' },
  { countryCode: 'JP', countryName: '일본', simType: 'esim', productName: '일본 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'jp-esim' },
  
  // 미국 (US)
  { countryCode: 'US', countryName: '미국', simType: 'usim', productName: '미국 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'us-usim' },
  { countryCode: 'US', countryName: '미국', simType: 'esim', productName: '미국 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'us-esim' },
  
  // 중국 (CN)
  { countryCode: 'CN', countryName: '중국', simType: 'usim', productName: '중국 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'cn-usim' },
  { countryCode: 'CN', countryName: '중국', simType: 'esim', productName: '중국 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'cn-esim' },
  
  // 대만 (TW)
  { countryCode: 'TW', countryName: '대만', simType: 'usim', productName: '대만 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'tw-usim' },
  { countryCode: 'TW', countryName: '대만', simType: 'esim', productName: '대만 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'tw-esim' },
  
  // 필리핀 (PH)
  { countryCode: 'PH', countryName: '필리핀', simType: 'usim', productName: '필리핀 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'ph-usim' },
  { countryCode: 'PH', countryName: '필리핀', simType: 'esim', productName: '필리핀 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'ph-esim' },
  
  // 인도네시아 (ID)
  { countryCode: 'ID', countryName: '인도네시아', simType: 'usim', productName: '인도네시아 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'id-usim' },
  { countryCode: 'ID', countryName: '인도네시아', simType: 'esim', productName: '인도네시아 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'id-esim' },
  
  // 말레이시아 (MY)
  { countryCode: 'MY', countryName: '말레이시아', simType: 'usim', productName: '말레이시아 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'my-usim' },
  { countryCode: 'MY', countryName: '말레이시아', simType: 'esim', productName: '말레이시아 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'my-esim' },
  
  // 홍콩마카오 (HK)
  { countryCode: 'HK', countryName: '홍콩마카오', simType: 'usim', productName: '홍콩마카오 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'hk-usim' },
  { countryCode: 'HK', countryName: '홍콩마카오', simType: 'esim', productName: '홍콩마카오 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'hk-esim' },
  
  // 호주 (AU)
  { countryCode: 'AU', countryName: '호주', simType: 'usim', productName: '호주 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'au-usim' },
  { countryCode: 'AU', countryName: '호주', simType: 'esim', productName: '호주 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'au-esim' },
  
  // 싱가포르 (SG)
  { countryCode: 'SG', countryName: '싱가포르', simType: 'usim', productName: '싱가포르 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'sg-usim' },
  { countryCode: 'SG', countryName: '싱가포르', simType: 'esim', productName: '싱가포르 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'sg-esim' },
  
  // 인도 (IN)
  { countryCode: 'IN', countryName: '인도', simType: 'usim', productName: '인도 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'in-usim' },
  { countryCode: 'IN', countryName: '인도', simType: 'esim', productName: '인도 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'in-esim' },
  
  // 라오스 (LA)
  { countryCode: 'LA', countryName: '라오스', simType: 'usim', productName: '라오스 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'la-usim' },
  { countryCode: 'LA', countryName: '라오스', simType: 'esim', productName: '라오스 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'la-esim' },
  
  // 기타 (ETC)
  { countryCode: 'ETC', countryName: '기타', simType: 'usim', productName: '기타 유심', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'etc-usim' },
  { countryCode: 'ETC', countryName: '기타', simType: 'esim', productName: '기타 eSIM', baseUrl: 'https://smartstore.naver.com/usimstore', productId: 'etc-esim' },
  ];
}

// 마케팅링크 데이터 (CSV에서 동적 로드)
export const MARKETING_LINKS: MarketingLink[] = loadMarketingLinksFromCSV();

// 트래킹 링크 생성 클래스
export class TrackingLinkService {
  /**
   * 설문 응답을 기반으로 트래킹 링크 생성
   * @param naverId 네이버 ID
   * @param countryCode 국가 코드
   * @param simType SIM 종류 (usim/esim)
   * @param dispatchCount 발송 횟수 (기본값: 1)
   * @returns 생성된 트래킹 링크
   */
  static generateTrackingLink(
    naverId: string,
    countryCode: string,
    simType: string,
    dispatchCount: number = 1
  ): string {
    // 마케팅링크 찾기 (정확한 매칭 우선)
    let marketingLink = MARKETING_LINKS.find(
      link => link.countryCode === countryCode && link.simType === simType
    );

    // 정확한 매칭이 없으면 유사한 국가나 SIM 유형으로 찾기
    if (!marketingLink) {
      // 동일한 국가의 다른 SIM 유형 찾기
      marketingLink = MARKETING_LINKS.find(
        link => link.countryCode === countryCode
      );
    }

    // 여전히 없으면 기본 유럽 eSIM 사용
    if (!marketingLink) {
      marketingLink = MARKETING_LINKS.find(
        link => link.countryCode === 'EU' && link.simType === 'esim'
      );
    }

    if (!marketingLink) {
      throw new Error(`No marketing link found for country: ${countryCode}, simType: ${simType}`);
    }

    // 심 종류 코드 생성 (usim -> u, esim -> e)
    const simCode = simType === 'usim' ? 'u' : 'e';
    
    // 트래킹 링크 생성
    // 형식: {baseUrl}?nt_source={naverId}&nt_medium={countryCode}{simCode}{dispatchCount}
    const baseUrl = marketingLink.baseUrl;
    const separator = baseUrl.includes('?') ? '&' : '?';
    const trackingLink = `${baseUrl}${separator}nt_source=${naverId}&nt_medium=${countryCode}${simCode}${dispatchCount}`;
    
    return trackingLink;
  }

  /**
   * 마케팅링크 정보 조회
   * @param countryCode 국가 코드
   * @param simType SIM 종류
   * @returns 마케팅링크 정보
   */
  static getMarketingLink(countryCode: string, simType: string): MarketingLink | null {
    return MARKETING_LINKS.find(
      link => link.countryCode === countryCode && link.simType === simType
    ) || null;
  }

  /**
   * 모든 국가 코드 조회
   * @returns 국가 코드 배열
   */
  static getAllCountryCodes(): string[] {
    return [...new Set(MARKETING_LINKS.map(link => link.countryCode))];
  }

  /**
   * 특정 국가의 SIM 종류 조회
   * @param countryCode 국가 코드
   * @returns SIM 종류 배열
   */
  static getSimTypesByCountry(countryCode: string): string[] {
    return MARKETING_LINKS
      .filter(link => link.countryCode === countryCode)
      .map(link => link.simType);
  }
}
