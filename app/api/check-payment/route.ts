import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    const headersList = await headers();
    const token = headersList.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ hasPaid: false }, { status: 401 });
    }

    // TODO: 실제로는 데이터베이스에서 결제 상태를 확인해야 합니다
    // 임시로 true 반환
    return NextResponse.json({ hasPaid: true });
  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json({ hasPaid: false }, { status: 500 });
  }
} 