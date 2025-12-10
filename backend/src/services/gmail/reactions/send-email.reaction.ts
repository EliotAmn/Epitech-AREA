/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  ParameterDefinition,
  ParameterType,
  ParameterValue,
  ServiceConfig,
  ServiceReactionDefinition,
} from '@/common/service.types';

// build raw RFC2822 message and send to Gmail API via fetch
export class SendEmailReaction extends ServiceReactionDefinition {
  name = 'send_email';
  description =
    'Sends an email via the connected Google account (requires google_access_token in service config)';
  input_params: ParameterDefinition[] = [
    {
      name: 'to',
      type: ParameterType.STRING,
      label: 'To',
      description: 'Recipient email address',
      required: true,
    },
    {
      name: 'subject',
      type: ParameterType.STRING,
      label: 'Subject',
      description: 'Email subject',
      required: true,
    },
    {
      name: 'body',
      type: ParameterType.STRING,
      label: 'Body',
      description: 'Email body content',
      required: true,
    },
    {
      name: 'body_type',
      type: ParameterType.STRING,
      label: 'Body type',
      description: 'text/plain or text/html (default text/plain)',
      required: false,
    },
  ];

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const token =
      sconf &&
      (sconf as any).config &&
      (sconf as any).config.google_access_token;
    if (!token) {
      throw new Error(
        'Missing Google access token in service config (google_access_token). Ensure the user connected with Google and token is stored for this service.',
      );
    }

    const to =
      params.to?.value && typeof params.to.value === 'string'
        ? params.to.value
        : null;
    const subject =
      params.subject?.value && typeof params.subject.value === 'string'
        ? params.subject.value
        : null;
    const body =
      params.body?.value && typeof params.body.value === 'string'
        ? params.body.value
        : null;
    const bodyType =
      params.body_type?.value && typeof params.body_type.value === 'string'
        ? params.body_type.value
        : 'text/plain';

    if (!to || !subject || !body) {
      throw new Error('Missing required parameters: to, subject or body');
    }

    // Build raw email
    const headers = [
      `To: ${to}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: ${bodyType}; charset="UTF-8"`,
    ];
    const raw = headers.join('\r\n') + '\r\n\r\n' + body;

    // base64url encode
    const base64 = Buffer.from(raw, 'utf8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw: base64 }),
      });
      console.log('Gmail API response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('Gmail API error:', res.status, text);
        throw new Error(`Gmail API error: ${res.status} ${text}`);
      }
    } catch (err) {
      console.error('Failed to send email via Gmail API', err);
      throw err;
    }
  }

  reload_cache(_sconf?: ServiceConfig): Promise<Record<string, any>> {
    return Promise.resolve({});
  }
}
