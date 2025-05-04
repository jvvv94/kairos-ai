import { NextResponse } from 'next/server';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'PDF 파일만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // PDF 파일을 ArrayBuffer로 변환
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    // PDF 로더를 사용하여 텍스트 추출
    const loader = new PDFLoader(blob);
    const docs = await loader.load();
    
    // 모든 페이지의 텍스트를 하나로 합침
    const text = docs.map(doc => doc.pageContent).join('\n');

    return NextResponse.json({ content: text });
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'PDF 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 