import { NextRequest, NextResponse } from 'next/server';
import { CAMPUS_SYSTEM_PROMPT, generateLocalCampusResponse } from '@/lib/gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';
import facultySeedData from '@/data/faculty.json';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, language = 'en', role = 'student', liveFaculty = facultySeedData } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key is configured in environment variables, use live Gemini 1.5 Flash
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction: CAMPUS_SYSTEM_PROMPT + `\n\nCurrent Real-Time Faculty Locations:\n${JSON.stringify(liveFaculty)}\nUser Role: ${role}\nTarget Language: ${language}`,
        });

        const prompt = `User Query in ${language}: "${message}". Provide a helpful, voice-ready answer.`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Check for reminder tag
        let reminderData: any = null;
        const reminderMatch = responseText.match(/\[REMINDER:\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\]/i);
        if (reminderMatch) {
          reminderData = {
            title: reminderMatch[1],
            datetime: new Date(Date.now() + 3600 * 1000 * 2).toISOString(),
            category: reminderMatch[3].toLowerCase() || 'personal',
          };
        }

        const cleanText = responseText.replace(/\[REMINDER:.*?\]/gi, '').trim();

        return NextResponse.json({
          answer: cleanText,
          language,
          detectedReminder: reminderData,
          suggestedActions: [
            'Where is Dr. Geetha?',
            'What is my attendance?',
            'When is the next bus?',
            'Upcoming events',
          ],
          source: 'gemini-1.5-flash',
        });
      } catch (geminiError) {
        console.warn('Gemini API call failed, falling back to local campus engine:', geminiError);
        // Seamless fallback to local engine
      }
    }

    // Local smart campus matcher (100% free, offline-ready, zero latency)
    const localResponse = generateLocalCampusResponse(message, role, language, liveFaculty);
    return NextResponse.json({
      ...localResponse,
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
