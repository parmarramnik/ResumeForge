import { NextResponse, type NextRequest } from 'next/server';
import nodemailer from 'nodemailer';

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const emailSubject = subject?.trim() ? `[ResumeForge Support] ${subject}` : '[ResumeForge Support] New Question from User';

    const formattedHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #09090b; border-bottom: 2px solid #09090b; padding-bottom: 10px; margin-top: 0;">New Question Received on ResumeForge</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr>
            <td style="padding: 8px 0; color: #71717a; width: 100px; font-weight: bold;">From:</td>
            <td style="padding: 8px 0; color: #09090b;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: bold;">User Email:</td>
            <td style="padding: 8px 0; color: #09090b;"><a href="mailto:${email}" style="color: #2563eb;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #71717a; font-weight: bold;">Subject:</td>
            <td style="padding: 8px 0; color: #09090b;">${subject || 'General Inquiry'}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 15px; background-color: #f4f4f5; border-radius: 6px; color: #18181b; line-height: 1.6;">
          <h4 style="margin-top: 0; color: #09090b; font-size: 14px;">Question / Message:</h4>
          <p style="white-space: pre-wrap; margin-bottom: 0;">${message}</p>
        </div>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 25px; border-top: 1px solid #e4e4e7; padding-top: 10px;">
          This message was submitted via ResumeForge Q&A form. You can reply directly to the sender at <a href="mailto:${email}">${email}</a>.
        </p>
      </div>
    `;

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: Number(process.env.SMTP_PORT) || 465,
        secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"ResumeForge Help Center" <${smtpUser}>`,
        replyTo: email,
        to: ADMIN_EMAIL,
        subject: emailSubject,
        html: formattedHtml,
      });

      console.log(`[SMTP Sent] Email successfully dispatched to ${ADMIN_EMAIL} from ${email}`);
    } else {
      console.log('----------------------------------------------------');
      console.log(`[Q&A Inquiry Logged - Ready to send to ${ADMIN_EMAIL}]`);
      console.log(`From: ${name} <${email}>`);
      console.log(`Subject: ${subject || 'No subject'}`);
      console.log(`Message: ${message}`);
      console.log('----------------------------------------------------');
      console.log('NOTE: To deliver real emails to Gmail inbox, add SMTP_USER & SMTP_PASS (Gmail App Password) in .env.local');
    }

    return NextResponse.json({
      success: true,
      message: 'Your question has been received. Our team will review and reply to your email shortly.',
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error.message : 'Failed to send question.';
    console.error('[SMTP Error]', error);
    return NextResponse.json(
      { success: false, error: `Failed to process message: ${err}` },
      { status: 500 }
    );
  }
}
