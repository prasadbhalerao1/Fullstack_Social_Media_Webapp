import nodemailer from "nodemailer";

let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  const hasSMTPConfig = 
    process.env.SMTP_HOST && 
    process.env.SMTP_PORT && 
    process.env.SMTP_USER && 
    process.env.SMTP_PASS;

  if (hasSMTPConfig) {
    console.log("[mailer] Using custom SMTP configuration.");
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: parseInt(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    console.log("[mailer] SMTP credentials missing in .env. Creating temporary Ethereal test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`[mailer] Ethereal Test Account Created: User: ${testAccount.user}`);
      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error("[mailer] Error creating Ethereal test account. Falling back to console logging transporter:", err);
      transporter = {
        sendMail: async (options) => {
          console.log("\n=================== DUMMY MAIL LOG ===================");
          console.log(`To: ${options.to}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Content:\n${options.html}`);
          console.log("======================================================\n");
          return { messageId: "dummy-id" };
        }
      };
    }
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const activeTransporter = await getTransporter();
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"RUNTIME Dev Social" <noreply@runtime.social>',
      to,
      subject,
      html,
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.log(`[mailer] Email sent successfully: ${info.messageId}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[mailer] View sent test mail preview at: ${previewUrl}`);
      return { success: true, previewUrl };
    }

    return { success: true };
  } catch (error) {
    console.error(`[mailer] Error sending email to ${to}:`, error);
    throw error;
  }
};
