import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || process.env.SMTP_HOST,
  port: parseInt(process.env.EMAIL_PORT || process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || process.env.SMTP_USER,
    pass: process.env.EMAIL_PASS || process.env.SMTP_PASS,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Evangelism App'}" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

export const sendWelcomeEmail = async (email: string, username: string, role: string) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">Welcome to the Evangelism App!</h2>
      <p>Hello ${username},</p>
      <p>Welcome to our community! Your account has been created successfully.</p>
      <p><strong>Role:</strong> ${role}</p>
      <p>You can now start your spiritual journey with us.</p>
      <a href="${process.env.FRONTEND_URL}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Get Started</a>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to Evangelism App',
    html,
  });
};

export const sendInvitationEmail = async (email: string, name: string, role: string, token: string) => {
  const roleText = role === 'DISCIPLE_MAKER' ? 'Mentor' : 'Church Finder';
  const inviteUrl = `${process.env.FRONTEND_URL}/register?invite=${token}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3b82f6;">You're Invited to Join as a ${roleText}!</h2>
      <p>Hello ${name},</p>
      <p>You've been invited to join our evangelism platform as a ${roleText}.</p>
      <p>Click the link below to create your account and get started:</p>
      <a href="${inviteUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Accept Invitation</a>
      <p>This invitation will expire in 7 days.</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: `Invitation to Join as ${roleText}`,
    html,
  });
};


