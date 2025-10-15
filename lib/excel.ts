import * as XLSX from 'xlsx';
import { SurveySubmission, ProductMapping } from '@/types';

export class ExcelService {
  static generateDispatchExcel(
    submissions: SurveySubmission[],
    mappings: ProductMapping[]
  ): Buffer {
    // 워크시트 데이터 생성
    const worksheetData = submissions.map((submission, index) => {
      const mapping = mappings.find(m => 
        m.country === submission.country && 
        m.days === submission.days
      );

      const orderNumber = `RV${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(index + 1).padStart(3, '0')}`;
      const customerId = `rv${String(index + 1).padStart(5, '0')}`;

      return {
        '상품주문번호 / 주문번호': orderNumber,
        '배송방법': '배송없음',
        '택배사/송장번호': '',
        '발송일': new Date().toISOString().slice(0, 10),
        '구매자명/ID/수취인명': submission.name,
        '주문상태/주문세부상태': '발송대기/신규주문',
        '결제위치/결제일': 'MOBILE / ' + new Date().toISOString().slice(0, 10),
        '상품번호/상품명': mapping?.sellerProductCode || '',
        '상품종류': '조합형옵션상품',
        '옵션정보1(연락처)': '',
        '옵션정보2(이메일)': submission.influencerEmail,
        '옵션정보3(출국일)': '',
        '옵션정보4(귀국일)': '',
        '옵션정보5(개통희망일)': submission.desiredStartDate.toISOString().slice(0, 10),
        '옵션정보6(수령방법)': '배송없음',
        '옵션정보7(요금플랜)': mapping?.planName || '',
        '옵션정보8(이용일수)': submission.days,
        '옵션정보9': '',
        '옵션정보10': '',
        '옵션관리코드': mapping?.sellerProductCode || '',
        '수량': 1,
        '가격': 0,
        '할인액': 0,
        '수취인연락처': '',
        '수취인주소': '',
        '우편번호': '',
        '배송메세지': '',
        '출고지': '',
        '결제수단': 'MOBILE',
        '개인통관고유부호': '',
        '주문일시': new Date().toISOString().slice(0, 19).replace('T', ' '),
        '판매채널': '스마트스토어',
      };
    });

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    // 컬럼 너비 설정
    const columnWidths = [
      { wch: 20 }, // 상품주문번호
      { wch: 10 }, // 배송방법
      { wch: 15 }, // 택배사/송장번호
      { wch: 12 }, // 발송일
      { wch: 15 }, // 구매자명
      { wch: 15 }, // 주문상태
      { wch: 20 }, // 결제위치
      { wch: 25 }, // 상품번호
      { wch: 15 }, // 상품종류
      { wch: 15 }, // 옵션정보1
      { wch: 25 }, // 옵션정보2
      { wch: 12 }, // 옵션정보3
      { wch: 12 }, // 옵션정보4
      { wch: 15 }, // 옵션정보5
      { wch: 12 }, // 옵션정보6
      { wch: 15 }, // 옵션정보7
      { wch: 10 }, // 옵션정보8
      { wch: 15 }, // 옵션정보9
      { wch: 15 }, // 옵션정보10
      { wch: 25 }, // 옵션관리코드
      { wch: 8 },  // 수량
      { wch: 10 }, // 가격
      { wch: 10 }, // 할인액
      { wch: 15 }, // 수취인연락처
      { wch: 30 }, // 수취인주소
      { wch: 10 }, // 우편번호
      { wch: 20 }, // 배송메세지
      { wch: 15 }, // 출고지
      { wch: 10 }, // 결제수단
      { wch: 20 }, // 개인통관고유부호
      { wch: 20 }, // 주문일시
      { wch: 15 }, // 판매채널
    ];

    worksheet['!cols'] = columnWidths;

    // 워크북 생성
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '발송목록');

    // 버퍼로 변환
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  }

  static generateSampleExcel(): Buffer {
    const sampleData = [
      {
        '상품주문번호 / 주문번호': 'RV20240115001',
        '배송방법': '배송없음',
        '택배사/송장번호': '',
        '발송일': '2024-01-15',
        '구매자명/ID/수취인명': '홍길동',
        '주문상태/주문세부상태': '발송대기/신규주문',
        '결제위치/결제일': 'MOBILE / 2024-01-15',
        '상품번호/상품명': 'ESAZB-JPKD007D_003GD',
        '상품종류': '조합형옵션상품',
        '옵션정보1(연락처)': '',
        '옵션정보2(이메일)': 'example@naver.com',
        '옵션정보3(출국일)': '',
        '옵션정보4(귀국일)': '',
        '옵션정보5(개통희망일)': '2024-01-20',
        '옵션정보6(수령방법)': '배송없음',
        '옵션정보7(요금플랜)': 'KDDI 7일',
        '옵션정보8(이용일수)': 7,
        '옵션정보9': '',
        '옵션정보10': '',
        '옵션관리코드': 'ESAZB-JPKD007D_003GD',
        '수량': 1,
        '가격': 0,
        '할인액': 0,
        '수취인연락처': '',
        '수취인주소': '',
        '우편번호': '',
        '배송메세지': '',
        '출고지': '',
        '결제수단': 'MOBILE',
        '개인통관고유부호': '',
        '주문일시': '2024-01-15 09:00:00',
        '판매채널': '스마트스토어',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '샘플');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static validateExcelFormat(file: Buffer): boolean {
    try {
      const workbook = XLSX.read(file, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (data.length < 2) return false;

      const headers = data[0] as string[];
      const requiredHeaders = [
        '상품주문번호 / 주문번호',
        '배송방법',
        '발송일',
        '구매자명/ID/수취인명',
        '상품번호/상품명',
        '옵션정보2(이메일)',
        '옵션정보5(개통희망일)',
        '옵션정보8(이용일수)',
      ];

      return requiredHeaders.every(header => headers.includes(header));
    } catch (error) {
      console.error('Excel validation error:', error);
      return false;
    }
  }

  static parseExcel(file: Buffer): any[] {
    try {
      const workbook = XLSX.read(file, { type: 'buffer' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      return XLSX.utils.sheet_to_json(worksheet);
    } catch (error) {
      console.error('Excel parsing error:', error);
      throw error;
    }
  }
}





