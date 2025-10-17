import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ProductMapping } from '@/types';

export const dynamic = 'force-dynamic';

// GET: 모든 상품 매핑 조회
export async function GET(request: NextRequest) {
  try {
    const mappingsSnapshot = await adminDb
      .collection('productMappings')
      .get();

    const mappings: ProductMapping[] = [];
    mappingsSnapshot.forEach((doc) => {
      mappings.push({ id: doc.id, ...doc.data() } as ProductMapping);
    });

    return NextResponse.json(mappings);
  } catch (error) {
    console.error('Failed to fetch product mappings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: 새 상품 매핑 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { country, simType, planName, days, sellerProductCode } = body;

    if (!country || !simType || !planName || !days || !sellerProductCode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const newMapping = {
      country,
      simType,
      planName,
      days,
      sellerProductCode,
    };

    const docRef = await adminDb.collection('productMappings').add(newMapping);

    return NextResponse.json(
      { 
        success: true, 
        id: docRef.id,
        mapping: { id: docRef.id, ...newMapping }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create product mapping:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

