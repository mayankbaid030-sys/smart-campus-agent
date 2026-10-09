import { NextRequest, NextResponse } from 'next/server';
import { CAMPUS_SYSTEM_PROMPT, generateLocalCampusResponse } from '@/lib/gemini';
import { GoogleGenAI } from '@google/genai';
import facultySeedData from '@/data/faculty.json';
import { LanguageCode } from '@/types';

// Detect likely script / language from characters
function detectLanguageCodeFromText(text: string, fallback: LanguageCode = 'en-IN'): LanguageCode {
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn-IN'; // Kannada
  if (/[\u0900-\u097F]/.test(text)) return 'hi-IN'; // Devanagari / Hindi
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te-IN'; // Telugu
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta-IN'; // Tamil
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml-IN'; // Malayalam
  if (/[\u0600-\u06FF]/.test(text)) return 'ur-IN'; // Arabic / Urdu
  return fallback;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', role = 'student', liveFaculty = facultySeedData } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const modelName = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const fallbackLangCode: LanguageCode = `${language}-IN` as LanguageCode;
    const initialDetectedCode = detectLanguageCodeFromText(message, fallbackLangCode);

    // If Gemini API Key is configured, use live modern @google/genai SDK
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `
${CAMPUS_SYSTEM_PROMPT}

MULTILINGUAL REPLY INSTRUCTION:
1. Detect the language and script in the user's message.
2. Reply in the EXACT SAME LANGUAGE the user typed in! (If user wrote in Kannada, reply in Kannada. If Hindi, reply in Hindi. If Urdu, reply in Urdu. If English, reply in English).
3. Return JSON with format:
{
  "languageCode": "kn-IN | hi-IN | en-IN | ta-IN | te-IN | ml-IN | ur-IN",
  "reply": "Concise, voice-ready answer in the exact same language"
}

Current Real-Time Faculty Locations:
${JSON.stringify(liveFaculty)}
User Role: ${role}
`;

        const response = await ai.models.generateContent({
          model: modelName,
          contents: `User message: "${message}". Detect language and reply in strict JSON.`,
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
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
          } else {
            parsed = {
              languageCode: initialDetectedCode,
              reply: rawText,
            };
          }
        }

        const replyText = parsed.reply || rawText;
        const finalLangCode = parsed.languageCode || initialDetectedCode;

        // Check for reminder tag
        let reminderData: any = null;
        const reminderMatch = replyText.match(/\[REMINDER:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/i);
        if (reminderMatch) {
          reminderData = {
            title: reminderMatch[1],
            datetime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
            category: reminderMatch[3].toLowerCase() || 'personal',
          };
        }

        const cleanText = replyText.replace(/\[REMINDER:.*?\]/gi, '').trim();

        return NextResponse.json({
          answer: cleanText,
          languageCode: finalLangCode,
          language,
          detectedReminder: reminderData,
          suggestedActions: [
            'Where is Dr. Geetha?',
            'What is my attendance?',
            'When is the next bus?',
            'Upcoming events',
          ],
          source: modelName,
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local campus engine:', geminiError);
      }
    }

    // Local smart campus matcher (100% free offline fallback)
    const localResponse = generateLocalCampusResponse(message, role, language, liveFaculty);
    return NextResponse.json({
      ...localResponse,
      languageCode: initialDetectedCode,
      source: 'snpu-local-engine',
    });
  } catch (error: any) {
    console.error('Error in /api/chat route:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
