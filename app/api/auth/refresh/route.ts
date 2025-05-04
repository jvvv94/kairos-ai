import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: '리프레시 토큰이 없습니다.' },
        { status: 401 }
      );
    }

    // 여기서 실제 토큰 갱신 로직을 구현해야 합니다.
    // 예시로 하드코딩된 응답을 반환합니다.
    const newToken = 'new_access_token';
    const expiresIn = 3600; // 1시간

    // 새로운 토큰을 쿠키에 저장
    cookieStore.set('accessToken', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });

    return NextResponse.json({
      token: newToken,
      expiresIn,
    });
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
    return NextResponse.json(
      { error: '토큰 갱신에 실패했습니다.' },
      { status: 500 }
    );
  }
} 