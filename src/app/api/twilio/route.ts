import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, type = 'sms' } = body;

    if (!to || !message) {
      return NextResponse.json({ error: 'Missing "to" or "message" parameters' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // If production Twilio credentials are configured in environment variables
    if (accountSid && authToken && fromNumber) {
      try {
        const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
        const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

        const params = new URLSearchParams();
        params.append('To', to);
        params.append('From', fromNumber);
        params.append('Body', message);

        const twilioRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
        });

        const data = await twilioRes.json();
        return NextResponse.json({
          success: true,
          provider: 'twilio-live',
          sid: data.sid,
          status: data.status,
        });
      } catch (err: any) {
        console.error('Twilio API request error:', err);
      }
    }

    // Free / Simulated Demo Mode (no billing needed)
    return NextResponse.json({
      success: true,
      provider: 'twilio-simulated-demo',
      message: `[Simulated Twilio ${type.toUpperCase()}] To: ${to} | Content: "${message}"`,
      note: 'Demo mode active. Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER to .env for real SMS transmission.',
    });
  } catch (error: any) {
    console.error('Error in /api/twilio route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
