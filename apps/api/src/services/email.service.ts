import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'apikey',
    pass: process.env.SMTP_PASS || '',
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EMAIL-DEV] To: ${options.to} | Subject: ${options.subject}`);
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'alerts@northstarstudent.ca',
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log(`[EMAIL] Sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    console.error(`[EMAIL] Failed to send to ${options.to}:`, error);
  }
}
