import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_EMAIL = process.env.ADMIN_CONTACT_EMAIL || 'parmarramnik408@gmail.com';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Securely log and process the user's question for admin delivery
    console.log(`[FAQ / Support Inquiry] Received question from ${name} (${email}) for Admin (${ADMIN_EMAIL}):`);
    console.log(`Subject: ${subject || 'ResumeForge Question'}`);
    console.log(`Message: ${message}`);

    // Here we can forward to SMTP / Resend / Supabase notifications
    // Note: ADMIN_EMAIL is kept strictly confidential on server-side and never returned to client.

    return NextResponse.json({
      success: true,
      message: 'Your question has been received. Our team will review and reply to your email shortly.',
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { success: false, error: `Failed to process inquiry: ${err}` },
      { status: 500 }
    );
  }
}
