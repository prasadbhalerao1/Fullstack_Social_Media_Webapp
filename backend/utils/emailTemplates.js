// HTML template for password reset email
export const getPasswordResetTemplate = (resetUrl) => {
  return `
    <div style="font-family: sans-serif; background-color: #000; color: #fff; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.1);">
      <h2 style="color: #fff; margin-bottom: 20px; font-weight: 800;">Password Reset Request</h2>
      <p style="color: #a3a3a3; line-height: 1.6; font-size: 14px;">You are receiving this because you (or someone else) requested a password reset for your account on RUNTIME.</p>
      <p style="color: #a3a3a3; line-height: 1.6; font-size: 14px;">Please click on the button below to reset your password:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${resetUrl}" style="background-color: #fff; color: #000; font-weight: bold; padding: 12px 30px; border-radius: 8px; text-decoration: none; display: inline-block; transition: background 0.2s;">Reset Password</a>
      </div>
      <p style="color: #a3a3a3; line-height: 1.6; font-size: 13px; margin-top: 25px;">Or copy and paste this link into your browser:</p>
      <div style="background-color: #0d0d0d; padding: 12px 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); font-family: monospace; font-size: 12px; word-break: break-all; margin: 15px 0; text-align: left;">
        <a href="${resetUrl}" style="color: #00f0ff; text-decoration: none;">${resetUrl}</a>
      </div>
      <p style="color: #555; font-size: 11px; margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
    </div>
  `;
};
