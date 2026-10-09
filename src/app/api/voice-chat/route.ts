import { NextRequest, NextResponse } from 'next/server';
import { CAMPUS_SYSTEM_PROMPT } from '@/lib/gemini';
import { GoogleGenAI } from '@google/genai';
import facultySeedData from '@/data/faculty.json';

const MAX_AUDIO_SIZE_BYTES = 15 * 1024 * 1024; // 15MB maximum
const ALLOWED_MIME_TYPES = [
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/wav',
  'audio/x-wav',
  'audio/mpeg',
  'audio/mp3',
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let audioBase64 = '';
    let mimeType = 'audio/webm';
    let role = 'student';
    let liveFaculty = facultySeedData;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('audio') as File | null;
      role = (formData.get('role') as string) || 'student';

      if (!file) {
        return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
      }

      if (file.size > MAX_AUDIO_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'Audio file exceeds 15MB limit' },
          { status: 413 }
        );
      }

      mimeType = file.type || 'audio/webm';
      const cleanMime = mimeType.split(';')[0].toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
        return NextResponse.json(
          { error: `Unsupported audio type: ${mimeType}. Expected webm, ogg, wav, or mp4.` },
          { status: 415 }
        );
      }

      const bytes = await file.arrayBuffer();
      audioBase64 = Buffer.from(bytes).toString('base64');
    } else {
      const body = await req.json();
      audioBase64 = body.audioBase64;
      mimeType = body.mimeType || 'audio/webm';
      role = body.role || 'student';
      if (body.liveFaculty) liveFaculty = body.liveFaculty;

      if (!audioBase64) {
        return NextResponse.json({ error: 'audioBase64 payload is required' }, { status: 400 });
      }

      // Check approx base64 size
      const approxBytes = (audioBase64.length * 3) / 4;
      if (approxBytes > MAX_AUDIO_SIZE_BYTES) {
        return NextResponse.json({ error: 'Audio exceeds 15MB limit' }, { status: 413 });
      }

      const cleanMime = mimeType.split(';')[0].toLowerCase();
      if (!ALLOWED_MIME_TYPES.includes(cleanMime)) {
        return NextResponse.json(
          { error: `Unsupported audio type: ${mimeType}` },
          { status: 415 }
        );
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'GEMINI_API_KEY not configured',
          fallbackNote: 'Please use text or browser speech input.',
        },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `
${CAMPUS_SYSTEM_PROMPT}

AUDIO INPUT INSTRUCTION:
You are listening directly to the user's recorded campus query.
1. Transcribe the user's spoken words into "transcript".
2. Detect the primary language spoken and set "languageCode" to one of:
   - "kn-IN" (Kannada)
   - "hi-IN" (Hindi)
   - "en-IN" (English)
   - "ta-IN" (Tamil)
   - "te-IN" (Telugu)
   - "ml-IN" (Malayalam)
   - "ur-IN" (Urdu)
3. Compose a concise, helpful, voice-ready "reply".
   IMPORTANT RULE: The "reply" MUST BE IN THE EXACT SAME LANGUAGE the user spoke!
   If the user mixed languages (e.g. Kanglish or Hinglish), reply in that dominant language.
4. Output strict JSON with format:
{
  "transcript": "User's spoken text",
  "languageCode": "kn-IN | hi-IN | en-IN | ta-IN | te-IN | ml-IN | ur-IN",
  "reply": "Helpful answer in the user's spoken language"
}
Do not enclose in markdown ticks if possible, or return raw JSON.

Current Real-Time Faculty Locations:
${JSON.stringify(liveFaculty)}
User Role: ${role}
`;

    const cleanMime = mimeType.split(';')[0].toLowerCase();
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          inlineData: {
            data: audioBase64,
            mimeType: cleanMime,
          },
        },
        {
          text: 'Listen to this user query and return JSON with transcript, languageCode, and reply.',
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '{}';
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawText);
    } catch {
      // Regex recovery if JSON was wrapped in markdown
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = {
          transcript: 'Spoken campus query',
          languageCode: 'en-IN',
          reply: rawText,
        };
      }
    }

    // Check for reminder tag in reply
    let reminderData: any = null;
    const reminderMatch = (parsed.reply || '').match(
      /\[REMINDER:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/i
    );
    if (reminderMatch) {
      reminderData = {
        title: reminderMatch[1],
        datetime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
        category: reminderMatch[3].toLowerCase() || 'personal',
      };
      parsed.reply = parsed.reply.replace(/\[REMINDER:.*?\]/gi, '').trim();
    }

    return NextResponse.json({
      success: true,
      transcript: parsed.transcript || '',
      languageCode: parsed.languageCode || 'en-IN',
      reply: parsed.reply || 'Here is your campus information.',
      detectedReminder: reminderData,
      source: modelName,
    });
  } catch (error: any) {
    console.error('Error in /api/voice-chat route:', error);
    return NextResponse.json(
      {
        error: 'Failed to process voice query',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
