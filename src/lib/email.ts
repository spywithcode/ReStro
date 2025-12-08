import nodemailer from 'nodemailer';

// Create transporter for sending emails
const createTransporter = async () => {
  // Use configured SMTP if credentials are provided (prioritize Gmail even in development)
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Using configured SMTP (Gmail) for email delivery');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // For Gmail, you might need to use app passwords
    });
    return transporter;
  }

  // Fall back to Ethereal Email for development/testing when no SMTP credentials
  console.log('Using Ethereal Email for development/testing (no SMTP credentials provided)');
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('Ethereal test account created:', testAccount);
  return transporter;
};

// Send password reset email
export const sendPasswordResetEmail = async (email: string, resetLink: string) => {
  const transporter = await createTransporter();

  const mailOptions = {
    from: process.env.FROM_EMAIL || 'noreply@restaurantapp.com',
    to: email,
    subject: 'Password Reset Request - Restaurant App',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your Restaurant App admin account.</p>
        <p>Please click the button below to reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}"
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">
          This is an automated message from Restaurant App. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `
      Password Reset Request - Restaurant App

      Hello,

      You have requested to reset your password for your Restaurant App admin account.

      Please visit this link to reset your password: ${resetLink}

      This link will expire in 1 hour for security reasons.

      If you didn't request this password reset, please ignore this email.

      This is an automated message from Restaurant App. Please do not reply to this email.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);

    // Log preview URL for Ethereal emails in development
    if (process.env.NODE_ENV !== 'production' && info && typeof info === 'object' && 'previewURL' in info) {
      console.log('Preview URL for password reset email:', (info as any).previewURL);
    }

    return info;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// For development/testing with Ethereal Email (fake SMTP service)
const createTestTransporter = async () => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't configure real SMTP
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('Test email account created:', testAccount);
  return transporter;
};
