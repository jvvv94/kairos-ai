import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { amount, user_id } = await req.json();
    
    const response = await fetch(process.env.KAKAO_PAY_READY_URL!, {
      method: 'POST',
      headers: {
        'Authorization': `KakaoAK ${process.env.KAKAO_PAY_ADMIN_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8'
      },
      body: new URLSearchParams({
        cid: process.env.KAKAO_PAY_CID!,
        partner_order_id: `ORDER_${Date.now()}`,
        partner_user_id: user_id,
        item_name: 'AI 인터뷰 서비스',
        quantity: 1,
        total_amount: amount,
        tax_free_amount: 0,
        approval_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
        fail_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/fail`
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment ready error:', error);
    return NextResponse.json({ error: '결제 준비 중 오류가 발생했습니다.' }, { status: 500 });
  }
} 