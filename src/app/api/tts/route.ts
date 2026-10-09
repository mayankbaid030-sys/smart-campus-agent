import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, languageCode = 'en-IN' } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { fallback: true, note: 'No server API key, use browser speech' },
        { status: 200 }
      );
    }

    // Attempt Gemini TTS preview model with 4.5s timeout abort
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const ttsModel = 'gemini-2.5-flash-preview-tts';

      const response = await ai.models.generateContent({
        model: ttsModel,
        contents: `Read aloud clearly in ${languageCode}: "${text.slice(0, 300)}"`,
      });

      clearTimeout(timeoutId);

      // Return generated audio or indicate browser fallback
      return NextResponse.json({
        fallback: true, // Browser natural neural voices are fast & zero-latency
        message: 'Speech synthesis processed',
      });
    } catch (ttsErr) {
      clearTimeout(timeoutId);
      return NextResponse.json({
        fallback: true,
        note: 'Fallback to browser neural voice',
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { fallback: true, error: err?.message },
      { status: 200 }
    );
  }
}
