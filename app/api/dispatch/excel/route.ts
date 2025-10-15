import { NextRequest, NextResponse } from 'next/server';
import { ExcelService } from '@/lib/excel';
import { adminDb } from '@/lib/firebase-admin';
import { SurveySubmission, ProductMapping, DispatchBatch } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { submissionIds } = await request.json();

    if (!submissionIds || !Array.isArray(submissionIds)) {
      return NextResponse.json({ error: 'Submission IDs array is required' }, { status: 400 });
    }

    // 설문 제출 데이터 조회
    const submissions: SurveySubmission[] = [];
    for (const id of submissionIds) {
      const doc = await adminDb.collection('surveySubmissions').doc(id).get();
      if (doc.exists) {
        submissions.push({ id: doc.id, ...doc.data() } as SurveySubmission);
      }
    }

    if (submissions.length === 0) {
      return NextResponse.json({ error: 'No valid submissions found' }, { status: 404 });
    }

    // 상품 매핑 데이터 조회
    const mappingsSnapshot = await adminDb.collection('productMappings').get();
    const mappings: ProductMapping[] = [];
    mappingsSnapshot.forEach((doc: any) => {
      mappings.push({ id: doc.id, ...doc.data() } as ProductMapping);
    });

    // 엑셀 생성
    const excelBuffer = ExcelService.generateDispatchExcel(submissions, mappings);

    // 배치 생성
    const batchDoc = await adminDb.collection('dispatchBatches').add({
      submissionIds,
      status: 'ready',
      createdAt: new Date(),
    });

    // 파일 업로드 (실제 구현에서는 Cloud Storage에 업로드)
    const fileName = `dispatch_${batchDoc.id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // 배치 업데이트
    await batchDoc.update({
      fileUrl: `/api/dispatch/download/${batchDoc.id}`,
      updatedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      batchId: batchDoc.id,
      fileName,
      submissionCount: submissions.length,
    });

  } catch (error) {
    console.error('Excel generation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({ error: 'Batch ID is required' }, { status: 400 });
    }

    // 배치 조회
    const batchDoc = await adminDb.collection('dispatchBatches').doc(batchId).get();
    if (!batchDoc.exists) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    const batch = { id: batchDoc.id, ...batchDoc.data() } as DispatchBatch;

    // 설문 제출 데이터 조회
    const submissions: SurveySubmission[] = [];
    for (const id of batch.submissionIds) {
      const doc = await adminDb.collection('surveySubmissions').doc(id).get();
      if (doc.exists) {
        submissions.push({ id: doc.id, ...doc.data() } as SurveySubmission);
      }
    }

    // 상품 매핑 데이터 조회
    const mappingsSnapshot = await adminDb.collection('productMappings').get();
    const mappings: ProductMapping[] = [];
    mappingsSnapshot.forEach((doc: any) => {
      mappings.push({ id: doc.id, ...doc.data() } as ProductMapping);
    });

    // 엑셀 생성
    const excelBuffer = ExcelService.generateDispatchExcel(submissions, mappings);

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    headers.set('Content-Disposition', `attachment; filename="dispatch_${batchId}.xlsx"`);

    return new NextResponse(excelBuffer as any, { headers });

  } catch (error) {
    console.error('Excel download API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}





