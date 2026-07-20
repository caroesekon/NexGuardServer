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
                This is an automated system notification. Please do not reply to this email.
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
This is an automated system notification.
`;

// ── Admin Welcome ────────────────────────────────────
const adminWelcome = async (data) => {
  const support = await getSupportInfo();
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #ffffff;">Welcome to the Team, ${data.name}! 🎉</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 16px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7;">
            Your admin account has been successfully created with the following role:
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748b;" width="120">Role</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #00c48c; font-weight: 600;">${data.role || 'Admin'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Email</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.email}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Password</td>
                    <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">Set during first login</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 8px;">
          <a href="${process.env.ADMIN_URL}" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Go to Admin Panel →</a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 16px 0 0; font-size: 12px; color: #475569;">
            For security, please change your password upon first login and enable two-factor authentication.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Welcome to NexGuard Admin, ${data.name}`,
    html: baseTemplate('Admin Account Created', content, support),
    text: `Welcome ${data.name}! Your admin account (${data.email}) with role ${data.role} has been created. Login at: ${process.env.ADMIN_URL}\n${textFooter(support)}`,
  };
};

// ── Backup Completed ─────────────────────────────────
const backupCompleted = async (data) => {
  const support = await getSupportInfo();
  const statusColor = data.success ? '#00c48c' : '#ef4444';
  const statusIcon = data.success ? '✅' : '❌';
  const statusText = data.success ? 'Completed Successfully' : 'Failed';
  
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px; text-align: center;">
          <h2 style="margin: 0; font-size: 48px;">${statusIcon}</h2>
          <h2 style="margin: 12px 0 0; font-size: 20px; color: ${statusColor};">Backup ${statusText}</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;" width="120">Filename</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0; word-break: break-all;">${data.filename || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Size</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${data.size ? (data.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Location</td>
              <td style="padding: 8px 0; font-size: 14px; color: #00c48c;">Cloud Storage</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Date</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </td>
      </tr>
      ${!data.success ? `
      <tr>
        <td style="padding-bottom: 16px;">
          <div style="background-color: rgba(239,68,68,0.1); border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5;">
              <strong>Error Details:</strong> ${data.error || 'Unknown error occurred during backup.'}
            </p>
          </div>
        </td>
      </tr>` : ''}
      <tr>
        <td>
          <p style="margin: 0; font-size: 12px; color: #475569;">
            Backup stored securely in cloud storage with AES-256 encryption.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Backup ${statusText} - NexGuard`,
    html: baseTemplate('Backup Status', content, support),
    text: `Backup ${statusText}\nFile: ${data.filename}\nSize: ${data.size ? (data.size / 1024 / 1024).toFixed(2) + ' MB' : 'N/A'}\nDate: ${new Date().toISOString()}\n${!data.success ? 'Error: ' + data.error : ''}\n${textFooter(support)}`,
  };
};

// ── System Health Alert ──────────────────────────────
const systemHealthAlert = async (data) => {
  const support = await getSupportInfo();
  const statusColor = data.status === 'up' ? '#00c48c' : '#ef4444';
  const statusBg = data.status === 'up' ? 'rgba(0,196,140,0.1)' : 'rgba(239,68,68,0.1)';
  const statusIcon = data.status === 'up' ? '✅' : '🚨';
  
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #ffffff;">${statusIcon} System Health Alert</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <div style="background-color: ${statusBg}; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #e2e8f0;">
              <strong>${data.component}</strong> is <span style="color: ${statusColor}; text-transform: uppercase; font-weight: 600;">${data.status}</span>
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;" width="120">Component</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">${data.component}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Status</td>
              <td style="padding: 8px 0; font-size: 14px; color: ${statusColor}; text-transform: uppercase; font-weight: 600;">${data.status}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;">Time</td>
              <td style="padding: 8px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleString('en-US')}</td>
            </tr>
            ${data.details ? `
            <tr>
              <td style="padding: 8px 0; font-size: 13px; color: #64748b;" valign="top">Details</td>
              <td style="padding: 8px 0; font-size: 14px; color: #94a3b8;">${data.details}</td>
            </tr>` : ''}
          </table>
        </td>
      </tr>
      ${data.status === 'down' ? `
      <tr>
        <td style="padding-bottom: 16px;">
          <div style="background-color: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 8px; padding: 16px;">
            <p style="margin: 0; font-size: 13px; color: #fca5a5;">
              <strong>⚠ Immediate Action Required:</strong> Please investigate this issue immediately. If you need assistance, contact the development team.
            </p>
          </div>
        </td>
      </tr>` : ''}
    </table>
  `;
  
  return {
    subject: `[${data.status.toUpperCase()}] System Health: ${data.component} - NexGuard`,
    html: baseTemplate('System Health Alert', content, support),
    text: `System Health Alert\nComponent: ${data.component}\nStatus: ${data.status.toUpperCase()}\nTime: ${new Date().toISOString()}\n${data.details ? 'Details: ' + data.details + '\n' : ''}${data.status === 'down' ? 'IMMEDIATE ACTION REQUIRED!\n' : ''}${textFooter(support)}`,
  };
};

// ── New User Registration ────────────────────────────
const newUserRegistration = async (data) => {
  const support = await getSupportInfo();
  
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #ffffff;">🆕 New User Registered</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="120">Name</td>
              <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Email</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Plan</td>
              <td style="padding: 10px 0; font-size: 14px; color: #00c48c; font-weight: 600;">${data.plan || 'Trial'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Date</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td>
          <a href="${process.env.ADMIN_URL}/clients" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">View User in Admin →</a>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `New User: ${data.name} - NexGuard`,
    html: baseTemplate('New Registration', content, support),
    text: `New User Registered\nName: ${data.name}\nEmail: ${data.email}\nPlan: ${data.plan || 'Trial'}\nDate: ${new Date().toISOString()}\nView: ${process.env.ADMIN_URL}/clients\n${textFooter(support)}`,
  };
};

// ── Payment Pending Approval ─────────────────────────
const paymentPendingApproval = async (data) => {
  const support = await getSupportInfo();
  
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #ffffff;">💰 Payment Requires Approval</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <p style="margin: 0; font-size: 14px; color: #94a3b8; line-height: 1.7;">
            A new payment has been submitted and is awaiting your review.
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="120">User</td>
              <td style="padding: 10px 0; font-size: 14px; color: #ffffff; font-weight: 600;">${data.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Email</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Amount</td>
              <td style="padding: 10px 0; font-size: 18px; color: #00c48c; font-weight: 700;">${data.amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Plan</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0; font-weight: 600;">${data.plan}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Date</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <a href="${process.env.ADMIN_URL}/approvals" style="display: inline-block; background: linear-gradient(135deg, #00c48c, #0098a6); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">Review & Approve →</a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="margin: 16px 0 0; font-size: 12px; color: #475569;">
            This action requires admin approval. Please review the payment details carefully before approving or rejecting.
          </p>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `Payment Pending: ${data.amount} from ${data.name} - NexGuard`,
    html: baseTemplate('Payment Approval Required', content, support),
    text: `Payment Pending Approval\nUser: ${data.name} (${data.email})\nAmount: ${data.amount}\nPlan: ${data.plan}\nApprove at: ${process.env.ADMIN_URL}/approvals\n${textFooter(support)}`,
  };
};

// ── Critical Threat Alert ────────────────────────────
const criticalThreatAlert = async (data) => {
  const support = await getSupportInfo();
  
  const content = `
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding-bottom: 20px;">
          <h2 style="margin: 0; font-size: 20px; color: #ef4444;">🚨 Critical Threat Detected</h2>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 20px;">
          <div style="background-color: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.4); border-radius: 8px; padding: 20px;">
            <p style="margin: 0; font-size: 14px; color: #fca5a5; line-height: 1.7;">
              <strong>⚠ Immediate Attention Required:</strong> A critical threat has been detected across multiple devices. Please review and take action immediately.
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #1e293b;">
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;" width="120">Threat Name</td>
              <td style="padding: 10px 0; font-size: 14px; color: #ef4444; font-weight: 600;">${data.threatName}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Type</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.threatType || 'Unknown'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Severity</td>
              <td style="padding: 10px 0; font-size: 14px; color: #ef4444; font-weight: 600;">🔴 Critical</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Affected</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${data.affectedCount || 'N/A'} device(s)</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-size: 13px; color: #64748b;">Detected</td>
              <td style="padding: 10px 0; font-size: 14px; color: #e2e8f0;">${new Date().toLocaleString('en-US')}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom: 12px;">
          <a href="${process.env.ADMIN_URL}/threats" style="display: inline-block; background: linear-gradient(135deg, #ef4444, #dc2626); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">View Threat Details →</a>
        </td>
      </tr>
    </table>
  `;
  
  return {
    subject: `🚨 CRITICAL THREAT: ${data.threatName} - NexGuard`,
    html: baseTemplate('Critical Threat Alert', content, support),
    text: `CRITICAL THREAT DETECTED\nThreat: ${data.threatName}\nType: ${data.threatType}\nSeverity: Critical\nAffected: ${data.affectedCount} device(s)\nTime: ${new Date().toISOString()}\nIMMEDIATE ACTION REQUIRED\nView: ${process.env.ADMIN_URL}/threats\n${textFooter(support)}`,
  };
};

module.exports = {
  adminWelcome,
  backupCompleted,
  systemHealthAlert,
  newUserRegistration,
  paymentPendingApproval,
  criticalThreatAlert,
};