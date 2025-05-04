import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('카카오 로그인 API 시작');
  
  try {
    const body = await request.json();
    console.log('요청 바디:', body);
    const { code } = body;
    console.log('인증 코드:', code);

    if (!code) {
      console.error('인증 코드가 없습니다.');
      return NextResponse.json(
        { error: '인증 코드가 없습니다.' },
        { status: 400 }
      );
    }

    // 환경 변수 체크
    console.log('모든 환경 변수:', {
      NEXT_PUBLIC_KAKAO_CLIENT_ID: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
      KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    });

    // 환경 변수 존재 여부 체크
    const envVars = {
      NEXT_PUBLIC_KAKAO_CLIENT_ID: !!process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
      KAKAO_REDIRECT_URI: !!process.env.KAKAO_REDIRECT_URI,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL
    };

    console.log('환경 변수 존재 여부:', envVars);

    if (!process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || !process.env.KAKAO_REDIRECT_URI) {
      console.error('환경 변수가 설정되지 않았습니다:', envVars);
      return NextResponse.json(
        { 
          error: '서버 설정 오류가 발생했습니다.',
          details: '환경 변수가 설정되지 않았습니다.',
          envVars
        },
        { status: 500 }
      );
    }

    // 프론트와 동일한 redirect_uri 사용
    const redirectUri = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || process.env.KAKAO_REDIRECT_URI;
    console.log('카카오 토큰 요청 redirect_uri:', redirectUri);

    // 카카오 토큰 요청
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID,
      redirect_uri: redirectUri,
      code,
    });

    console.log('카카오 토큰 요청 시작:', {
      url: 'https://kauth.kakao.com/oauth/token',
      params: tokenParams.toString()
    });

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    console.log('카카오 토큰 응답 상태:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('카카오 토큰 요청 실패:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData,
        requestUrl: 'https://kauth.kakao.com/oauth/token',
        requestParams: tokenParams.toString()
      });
      throw new Error(`카카오 토큰 요청 실패: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('카카오 토큰 응답 데이터:', tokenData);

    if (!tokenData.access_token) {
      console.error('토큰 데이터에 access_token이 없습니다:', tokenData);
      throw new Error('토큰 데이터에 access_token이 없습니다');
    }

    const { access_token, refresh_token, expires_in } = tokenData;
    console.log('토큰 데이터 추출:', { access_token, refresh_token, expires_in });

    // 카카오 사용자 정보 요청
    console.log('카카오 사용자 정보 요청 시작');
    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    console.log('카카오 사용자 정보 응답 상태:', userResponse.status);

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('카카오 사용자 정보 요청 실패:', {
        status: userResponse.status,
        statusText: userResponse.statusText,
        error: errorData,
        accessToken: access_token
      });
      throw new Error(`카카오 사용자 정보 요청 실패: ${errorData}`);
    }

    const userData = await userResponse.json();
    console.log('카카오 사용자 정보 응답 데이터:', userData);

    if (!userData.id) {
      console.error('사용자 데이터에 id가 없습니다:', userData);
      throw new Error('사용자 데이터에 id가 없습니다');
    }

    const user = {
      id: userData.id.toString(),
      nickname: userData.properties?.nickname,
      email: userData.kakao_account?.email,
    };

    console.log('사용자 정보 추출:', user);

    // 토큰을 쿠키에 저장
    console.log('쿠키 저장 시작');
    const cookieStore = await cookies();
    cookieStore.set('accessToken', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/',
    });

    cookieStore.set('refreshToken', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30일
      path: '/',
    });
    console.log('쿠키 저장 완료');

    console.log('최종 응답 생성');
    return NextResponse.json({
      user,
      token: access_token,
      expiresIn: expires_in,
    });
  } catch (error) {
    console.error('카카오 로그인 전체 프로세스 실패:', error);
    return NextResponse.json(
      { 
        error: '카카오 로그인에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 