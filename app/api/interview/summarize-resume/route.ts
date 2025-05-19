import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { content } = await req.json();
    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // OpenAI 요약 프롬프트
    const prompt = `아래 이력서 텍스트에서 경력, 주요 프로젝트, 지원동기, 기타 중요한 정보를 항목별로 간결하게 요약해줘.\n- 경력:\n- 주요 프로젝트:\n- 지원동기:\n- 기타:\n---\n${content}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
      temperature: 0.2,
    });

    const summary = completion.choices[0].message.content;
    return NextResponse.json({ summary });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 });
  }
} 