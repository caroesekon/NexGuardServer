const getSupportInfo = async () => {
  try {
    const Setting = require('../models/admin/Setting');
    const settings = await Setting.findOne();
    return {
      email: settings?.supportEmail || 'support@nexguard.io',
      phone: settings?.supportPhone || '+254 700 000 000',
    };
  } catch {
    return {
      email: 'support@nexguard.io',
      phone: '+254 700 000 000',
    };
  }
};

const baseTemplate = (title, content, support) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | NexGuard</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0a0e17; color: #e2e8f0;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0e17; padding: 40px 0;">
    <tr>
      <td align="center">
        
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(145deg, #111827 0%, #1a2332 100%); border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 25px 50px rgba(0,0,0,0.4);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #00c48c 0%, #0098a6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 1px;">
                ⚡ NEXGUARD
              </h1>
              <p style="margin: 8px 0 0; font-size: 13px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 3px;">
                ${title}
              </p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          
          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border: none; border-top: 1px solid #1e293b; margin: 0;">
            </td>
          </tr>
          
          <!-- Support -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                Need help? Contact our support team
              </p>
              <p style="margin: 6px 0 0; font-size: 13px;">
                <a href="mailto:${support.email}" style="color: #00c48c; text-decoration: none; font-weight: 600;">${support.email}</a>
                <span style="color: #334155; margin: 0 10px;">|</span>
                <span style="color: #94a3b8;">${support.phone}</span>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #475569;">
                © ${new Date().getFullYear()} NexGuard. All rights reserved.<br>
                From the <strong>HDM Team</strong>
              </p>
              <p style="margin: 6px 0 0; font-size: 10px; color: #334155;">
                This is an automated notification. Please do not reply to this email.
              </p>
            </td>
          </tr>
          
        </table>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
`;

const textFooter = (support) => `
---
Need help? Contact: ${support.email} | ${support.phone}
© ${new Date().getFullYear()} NexGuard. All rights reserved. Created by Davis Okoth.
`;

// ── Welcome ──────────────────────────────────────────
const welcome = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Welcome to NexGuard, ${data.name}! 🛡️</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your account has been created successfully. You're now protected by next-generation cybersecurity.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="33%" style="padding: 0 8px; text-align: center;">
                <div style="background-color: #0f172a; border-radius: 8px; padding: 20px 12px; border: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 28px;">🛡️</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #00c48c; font-weight: 600;">Real-Time Protection</p>
                </div>
              </td>
              <td width="33%" style="padding: 0 8px; text-align: center;">
                <div style="background-color: #0f172a; border-radius: 8px; padding: 20px 12px; border: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 28px;">🔍</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #00c48c; font-weight: 600;">Deep Scanning</p>
                </div>
              </td>
              <td width="33%" style="padding: 0 8px; text-align: center;">
                <div style="background-color: #0f172a; border-radius: 8px; padding: 20px 12px; border: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 28px;">🔒</p>
                  <p style="margin: 8px 0 0; font-size: 12px; color: #00c48c; font-weight: 600;">Secure VPN</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Go to Dashboard →</a>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Welcome to NexGuard, ${data.name}!`,
    html: baseTemplate('Welcome', content, support),
    text: `Welcome to NexGuard, ${data.name}! Your account is ready. Get started: ${process.env.CLIENT_URL}/dashboard\n${textFooter(support)}`,
  };
};

// ── Verify Email ─────────────────────────────────────
const verifyEmail = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Verify Your Email ✉️</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Please verify your email address to activate your account and enable all features.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px; text-align: center;">
          <a href="${data.verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px;">Verify Email →</a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            Or copy this link: <a href="${data.verificationUrl}" style="color: #00c48c; word-break: break-all;">${data.verificationUrl}</a>
          </p>
          <p style="margin: 12px 0 0; font-size: 11px; color: #334155; text-align: center;">
            This link expires in 24 hours. If you did not create this account, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Verify Your Email - NexGuard',
    html: baseTemplate('Email Verification', content, support),
    text: `Verify your email: ${data.verificationUrl}\nThis link expires in 24 hours.\n${textFooter(support)}`,
  };
};

// ── Password Reset ───────────────────────────────────
const passwordReset = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Reset Your Password 🔑</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px; text-align: center;">
          <a href="${data.resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 15px;">Reset Password →</a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            Or copy: <a href="${data.resetUrl}" style="color: #00c48c; word-break: break-all;">${data.resetUrl}</a>
          </p>
          <p style="margin: 12px 0 0; font-size: 11px; color: #334155; text-align: center;">
            This link expires in 1 hour. If you did not request this, please ignore this email.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Reset Your Password - NexGuard',
    html: baseTemplate('Password Reset', content, support),
    text: `Reset your password: ${data.resetUrl}\nExpires in 1 hour. Ignore if not requested.\n${textFooter(support)}`,
  };
};

// ── Password Changed ─────────────────────────────────
const passwordChanged = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">✅</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #00c48c;">Password Changed Successfully</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your password has been updated. If you did not make this change, contact our support team immediately.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #1e293b;">
            <tr>
              <td style="font-size: 13px; color: #64748b;">Date & Time</td>
              <td style="font-size: 13px; color: #e2e8f0; text-align: right;">${new Date().toLocaleString('en-US')}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            If this wasn't you, please contact us immediately at <a href="mailto:${support.email}" style="color: #ef4444;">${support.email}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Password Changed - NexGuard',
    html: baseTemplate('Password Changed', content, support),
    text: `Your password was changed on ${new Date().toLocaleString()}. If not you, contact ${support.email} immediately.\n${textFooter(support)}`,
  };
};

// ── New Device Login ─────────────────────────────────
const loginNewDevice = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">📱</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #f59e0b;">New Device Login Detected</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your account was accessed from a new device. If this was you, no action is needed.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;" width="120">Device</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.device || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Browser</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.browser || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">IP Address</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.ip || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Location</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.location || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Time</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleString('en-US')}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            If this wasn't you, <a href="mailto:${support.email}" style="color: #ef4444;">report it immediately</a> and change your password.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'New Device Login - NexGuard',
    html: baseTemplate('Security Alert', content, support),
    text: `New device login detected.\nDevice: ${data.device}\nIP: ${data.ip}\nLocation: ${data.location}\nTime: ${new Date().toLocaleString()}\nNot you? Contact ${support.email}\n${textFooter(support)}`,
  };
};

// ── Account Locked ───────────────────────────────────
const accountLocked = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">🔒</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #ef4444;">Account Temporarily Locked</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your account has been locked due to ${data.failedAttempts || 'multiple'} failed login attempts. This is a security measure to protect your account.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 16px;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5; text-align: center;">
              Locked until: ${data.lockedUntil || '30 minutes from now'}
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            You can reset your password or contact support at <a href="mailto:${support.email}" style="color: #00c48c;">${support.email}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Account Locked - NexGuard',
    html: baseTemplate('Account Locked', content, support),
    text: `Account locked due to ${data.failedAttempts} failed attempts. Unlocks: ${data.lockedUntil}. Contact: ${support.email}\n${textFooter(support)}`,
  };
};

// ── Account Deleted ──────────────────────────────────
const accountDeleted = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; color: #ef4444;">Account Deleted</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your NexGuard account has been permanently deleted. All your data, scans, alerts, and settings have been removed from our systems.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5;">
              <strong>Note:</strong> Deletion is permanent and cannot be undone. If this was a mistake, please contact support within 30 days.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            We're sorry to see you go. If you have feedback, please let us know at <a href="mailto:${support.email}" style="color: #00c48c;">${support.email}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Account Deleted - NexGuard',
    html: baseTemplate('Account Deleted', content, support),
    text: `Your account has been permanently deleted. Contact ${support.email} within 30 days if this was a mistake.\n${textFooter(support)}`,
  };
};

// ── Account Suspended ────────────────────────────────
const accountSuspended = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">⛔</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #f59e0b;">Account Suspended</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your account has been suspended. You will not be able to access NexGuard services until the suspension is lifted.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: rgba(245,158,11,0.1); border-left: 4px solid #f59e0b; padding: 16px; border-radius: 4px;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #fcd34d;"><strong>Reason:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #e2e8f0;">${data.reason || 'Violation of Terms of Service'}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            For more information, contact <a href="mailto:${support.email}" style="color: #00c48c;">${support.email}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Account Suspended - NexGuard',
    html: baseTemplate('Account Suspended', content, support),
    text: `Your account has been suspended. Reason: ${data.reason || 'Terms violation'}. Contact: ${support.email}\n${textFooter(support)}`,
  };
};

// ── Account Reactivated ──────────────────────────────
const accountReactivated = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">✅</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #00c48c;">Account Reactivated</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Great news! Your NexGuard account has been reactivated. All features are now available.
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Go to Dashboard →</a>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Account Reactivated - NexGuard',
    html: baseTemplate('Account Reactivated', content, support),
    text: `Your account has been reactivated! Welcome back. ${process.env.CLIENT_URL}/dashboard\n${textFooter(support)}`,
  };
};

// ── Account Deactivated ──────────────────────────────
const accountDeactivated = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">💤</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #64748b;">Account Deactivated</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your account has been deactivated. You can reactivate it at any time by logging in or contacting support.
          </p>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            Reactivate: <a href="${process.env.CLIENT_URL}/login" style="color: #00c48c;">${process.env.CLIENT_URL}/login</a> or contact <a href="mailto:${support.email}" style="color: #00c48c;">${support.email}</a>
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'Account Deactivated - NexGuard',
    html: baseTemplate('Account Deactivated', content, support),
    text: `Your account has been deactivated. Reactivate at ${process.env.CLIENT_URL}/login or contact ${support.email}\n${textFooter(support)}`,
  };
};

// ── Trial Registration ───────────────────────────────
const trialRegistration = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 22px; color: #ffffff;">Trial Started! 🎉</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your ${data.trialDays || 30}-day free trial gives you full access to all NexGuard features.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="140">Trial Period</td>
              <td style="padding: 10px 0; font-size: 14px; color: #00c48c; font-weight: 600;">${data.trialDays || 30} Days</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Started</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Expires</td>
              <td style="padding: 10px 0; font-size: 14px; color: #f59e0b;">${data.trialEnd || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Devices</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.deviceLimit || 1}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Start Protecting →</a>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Your ${data.trialDays || 30}-Day Trial Has Started - NexGuard`,
    html: baseTemplate('Trial Started', content, support),
    text: `Trial started! ${data.trialDays || 30} days. Expires: ${data.trialEnd}. Start: ${process.env.CLIENT_URL}/dashboard\n${textFooter(support)}`,
  };
};

// ── Trial Expiring (10, 5, 3 days) ───────────────────
const trialExpiring10 = async (data) => trialExpiring(data, 10);
const trialExpiring5 = async (data) => trialExpiring(data, 5);
const trialExpiring3 = async (data) => trialExpiring(data, 3);

const trialExpiring = async (data, days) => {
  const support = await getSupportInfo();
  const urgencyColor = days <= 3 ? '#ef4444' : days <= 5 ? '#f59e0b' : '#f59e0b';
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">⏰</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: ${urgencyColor};">${days} Days Left</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your free trial expires in <strong style="color: ${urgencyColor};">${days} days</strong>. Upgrade now to keep your protection active.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="140">Trial Ends</td>
              <td style="padding: 10px 0; font-size: 14px; color: ${urgencyColor}; font-weight: 600;">${data.trialEnd || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Plan</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.currentPlan || 'Trial'}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/subscription" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Upgrade Now →</a>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 16px;">
          <p style="margin: 0; font-size: 11px; color: #334155; text-align: center;">
            After trial ends, protection will be paused until subscription is activated.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `${days} Days Left in Your Trial - NexGuard`,
    html: baseTemplate('Trial Expiring', content, support),
    text: `Your trial expires in ${days} days (${data.trialEnd}). Upgrade: ${process.env.CLIENT_URL}/subscription\n${textFooter(support)}`,
  };
};

const paymentReceived = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">💳</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #00c48c;">Payment Received!</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            We received your payment of <strong style="color: #00c48c; font-size: 18px;">${data.amount}</strong> for the <strong>${data.plan}</strong> plan.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="120">Amount</td>
              <td style="padding: 10px 0; font-size: 16px; color: #00c48c; font-weight: 700;">${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Plan</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">${data.plan}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Status</td>
              <td style="padding: 10px 0; font-size: 14px; color: #f59e0b; font-weight: 600;">⏳ Pending Approval</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Date</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          <div style="background-color: rgba(0,196,140,0.1); border-left: 4px solid #00c48c; padding: 14px 16px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #5ee2c0;">
              <strong>🔑 License Key:</strong> Your license key will be sent once your payment is approved.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569; text-align: center;">
            Your account will be activated and license key sent once payment is approved (usually within 24 hours).
          </p>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Payment Received - ${data.amount} - NexGuard`,
    html: baseTemplate('Payment Received', content, support),
    text: `Payment of ${data.amount} received for ${data.plan}. Status: Pending Approval. Your license key will be sent once approved.\n${textFooter(support)}`,
  };
};

// ── Payment Approved ─────────────────────────────────
const paymentApproved = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">🎉</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #00c48c;">Account Activated!</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your payment has been approved and your <strong style="color: #00c48c;">${data.plan}</strong> plan is now active. All features are unlocked!
          </p>
        </td>
      </tr>
      ${data.licenseKey ? `
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 20px; text-align: center;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">Your License Key</p>
            <p style="margin: 0; font-size: 18px; font-family: monospace; color: #00c48c; letter-spacing: 2px; font-weight: 700;">${data.licenseKey}</p>
            <p style="margin: 8px 0 0; font-size: 11px; color: #475569;">Use this key to activate the desktop agent</p>
          </div>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="50%" style="padding: 0 8px; text-align: center;">
                <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 24px;">🛡️</p>
                  <p style="margin: 6px 0 0; font-size: 11px; color: #00c48c;">Protection Active</p>
                </div>
              </td>
              <td width="50%" style="padding: 0 8px; text-align: center;">
                <div style="background-color: #0f172a; border-radius: 8px; padding: 16px; border: 1px solid #1e293b;">
                  <p style="margin: 0; font-size: 24px;">🔒</p>
                  <p style="margin: 6px 0 0; font-size: 11px; color: #00c48c;">VPN Ready</p>
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Go to Dashboard →</a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: 'Account Activated - NexGuard',
    html: baseTemplate('Account Activated', content, support),
    text: `Account Activated! Your ${data.plan} plan is now active.${data.licenseKey ? ` License Key: ${data.licenseKey}` : ''} ${process.env.CLIENT_URL}/dashboard\n${textFooter(support)}`,
  };
};

// ── VPN Session Alert ────────────────────────────────
const vpnSessionAlert = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">🔐</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #00c48c;">VPN Session Started</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="120">Gateway</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.gateway || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">IP Address</td>
              <td style="padding: 10px 0; font-size: 14px; color: #00c48c;">${data.assignedIp || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Device</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.device || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Time</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleString('en-US')}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 0; font-size: 11px; color: #334155; text-align: center;">
            Your traffic is now encrypted and secure. Kill switch is ${data.killSwitch ? 'enabled' : 'disabled'}.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: 'VPN Connected - NexGuard',
    html: baseTemplate('VPN Session', content, support),
    text: `VPN Connected\nGateway: ${data.gateway}\nIP: ${data.assignedIp}\nDevice: ${data.device}\n${textFooter(support)}`,
  };
};

const trialExpired = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">⏱️</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #ef4444;">Trial Expired</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Your free trial has ended. Choose a plan to continue enjoying NexGuard protection.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 16px;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5; text-align: center;">
              <strong>⚠ Protection Paused:</strong> Real-time scanning, firewall, and VPN are now inactive.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/subscription" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Choose a Plan →</a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: 'Trial Expired - NexGuard',
    html: baseTemplate('Trial Expired', content, support),
    text: `Your trial has expired. Protection is paused. Subscribe: ${process.env.CLIENT_URL}/subscription\n${textFooter(support)}`,
  };
};

const applicationRejected = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">❌</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: #ef4444;">Application Rejected</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            Unfortunately, your application for the <strong>${data.plan}</strong> plan has been rejected.
          </p>
        </td>
      </tr>
      ${data.reason ? `
      <tr>
        <td style="padding-bottom: 24px;">
          <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; padding: 16px; border-radius: 4px;">
            <p style="margin: 0 0 6px; font-size: 13px; color: #fca5a5;"><strong>Reason:</strong></p>
            <p style="margin: 0; font-size: 13px; color: #e2e8f0;">${data.reason}</p>
          </div>
        </td>
      </tr>` : ''}
      <tr>
        <td style="padding-bottom: 16px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7; text-align: center;">
            You can apply again or contact support for more information.
          </p>
        </td>
      </tr>
      <tr>
        <td style="text-align: center;">
          <a href="${process.env.CLIENT_URL}/pricing" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Apply Again →</a>
        </td>
      </tr>
    </table>
  `;

  return {
    subject: `Application Rejected - NexGuard`,
    html: baseTemplate('Application Rejected', content, support),
    text: `Your application for ${data.plan} has been rejected. Reason: ${data.reason || 'N/A'}. Apply again: ${process.env.CLIENT_URL}/pricing\n${textFooter(support)}`,
  };
};

module.exports = {
  welcome,
  verifyEmail,
  passwordReset,
  passwordChanged,
  loginNewDevice,
  accountLocked,
  accountDeleted,
  accountSuspended,
  accountReactivated,
  accountDeactivated,
  trialRegistration,
  trialExpiring10,
  trialExpiring5,
  trialExpiring3,
  trialExpired,
  paymentReceived,
  paymentApproved,
  vpnSessionAlert,
  applicationRejected,
};