import { NextRequest, NextResponse } from 'next/server';
import { normalizePhone, resolveRoleFromSeed } from '@/lib/localStorageUtil';

// In-memory OTP storage for the serverless instance lifecycle
const demoOtpStore: Record<string, { code: string; expiresAt: number }> = {};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phoneNumber, code } = body;

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    const normalized = normalizePhone(phoneNumber);

    // ACTION: SEND OTP
    if (action === 'send') {
      // Validate Indian phone format (+91 followed by 10 digits starting 6,7,8,9)
      const indianPhoneRegex = /^\+91[6-9]\d{9}$/;
      if (!indianPhoneRegex.test(normalized)) {
        return NextResponse.json(
          {
            error: 'Invalid Indian phone number. Must be 10 digits starting with 6, 7, 8, or 9.',
          },
          { status: 400 }
        );
      }

      // Generate realistic 6-digit OTP code (e.g. 584920)
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      demoOtpStore[normalized] = {
        code: generatedCode,
        expiresAt,
      };

      const resolved = resolveRoleFromSeed(normalized);

      return NextResponse.json({
        success: true,
        phoneNumber: normalized,
        demoOtp: generatedCode, // Clearly provided for Demo OTP UI box
        message: 'Demo OTP generated successfully.',
        role: resolved.role,
        userName: resolved.name,
        expiresInSeconds: 300,
      });
    }

    // ACTION: VERIFY OTP
    if (action === 'verify') {
      if (!code || typeof code !== 'string') {
        return NextResponse.json({ error: 'Verification code is required' }, { status: 400 });
      }

      const storedRecord = demoOtpStore[normalized];

      // Allow either stored code, or demo default "123456" for instant evaluation testing
      const isValid =
        (storedRecord && storedRecord.code === code.trim() && Date.now() < storedRecord.expiresAt) ||
        code.trim() === '123456';

      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid or expired OTP. Please use the 6-digit code shown in the Demo OTP box.',
          },
          { status: 401 }
        );
      }

      // Delete used OTP
      delete demoOtpStore[normalized];

      const resolved = resolveRoleFromSeed(normalized);

      return NextResponse.json({
        success: true,
        phoneNumber: normalized,
        role: resolved.role,
        name: resolved.name,
        details: resolved.details,
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in /api/otp route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
