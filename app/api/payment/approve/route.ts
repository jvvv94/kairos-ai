import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { pg_token, tid, partner_order_id, partner_user_id } = await req.json();
    
    const response = await fetch(process.env.KAKAO_PAY_APPROVE_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_PAY_ADMIN_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: new URLSearchParams({
        cid: process.env.KAKAO_PAY_CID!,
        tid: tid,
        partner_order_id: partner_order_id,
        partner_user_id: partner_user_id,
        pg_token: pg_token
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment approve error:', error);
    return NextResponse.json({ error: '결제 승인 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 