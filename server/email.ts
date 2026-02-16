import { Resend } from 'resend';

let cachedCredentials: { apiKey: string; fromEmail: string } | null = null;

async function getCredentials(): Promise<{ apiKey: string; fromEmail: string }> {
  if (cachedCredentials) return cachedCredentials;

  if (process.env.RESEND_API_KEY) {
    cachedCredentials = {
      apiKey: process.env.RESEND_API_KEY,
      fromEmail: process.env.RESEND_FROM_EMAIL || 'IT Ops Console <noreply@itopsconsole.com>',
    };
    return cachedCredentials;
  }

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken || !hostname) {
    throw new Error('Email not configured. Set RESEND_API_KEY or connect Resend in Replit.');
  }

  const data = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json());

  const connectionSettings = data.items?.[0];

  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error('Resend not connected');
  }

  cachedCredentials = {
    apiKey: connectionSettings.settings.api_key,
    fromEmail: connectionSettings.settings.from_email || 'IT Ops Console <noreply@itopsconsole.com>',
  };
  return cachedCredentials;
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendInvitationEmail(
  toEmail: string, 
  inviteToken: string, 
  inviterName: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const baseUrl = process.env.APP_URL 
      || (process.env.NODE_ENV === 'production' ? 'https://itopsconsole.com' : 'http://localhost:5000');
    
    const inviteUrl = `${baseUrl}/register?token=${inviteToken}`;
    
    await client.emails.send({
      from: fromEmail,
      to: toEmail,
      subject: 'You\'ve been invited to IT Ops Console',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background-color: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
              <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #F47321; margin: 0; font-size: 28px;">IT Ops Console</h1>
                <p style="color: #64748b; margin-top: 8px;">Healthcare IT Operations Dashboard</p>
              </div>
              
              <h2 style="color: #1e293b; margin-bottom: 16px;">You're Invited!</h2>
              
              <p style="color: #475569; line-height: 1.6;">
                <strong>${inviterName}</strong> has invited you to join IT Ops Console, the unified dashboard for healthcare IT operations.
              </p>
              
              <p style="color: #475569; line-height: 1.6;">
                Click the button below to create your account and get started:
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteUrl}" style="display: inline-block; background-color: #F47321; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
                  Accept Invitation
                </a>
              </div>
              
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
                This invitation expires in 7 days. If you didn't expect this invitation, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0;">
              
              <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
                IT Ops Console - University of Michigan Healthcare IT
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    
    return true;
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return false;
  }
}

export async function isEmailConfigured(): Promise<boolean> {
  try {
    await getCredentials();
    return true;
  } catch {
    return false;
  }
}
