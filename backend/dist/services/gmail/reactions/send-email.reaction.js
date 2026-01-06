"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendEmailReaction = void 0;
const service_types_1 = require("../../../common/service.types");
class SendEmailReaction extends service_types_1.ServiceReactionDefinition {
    name = 'send_email';
    label = 'Send Email';
    description = 'Sends an email via the connected Google account (requires google_access_token in service config)';
    input_params = [
        {
            name: 'to',
            type: service_types_1.ParameterType.STRING,
            label: 'To',
            description: 'Recipient email address',
            required: true,
        },
        {
            name: 'subject',
            type: service_types_1.ParameterType.STRING,
            label: 'Subject',
            description: 'Email subject',
            required: true,
        },
        {
            name: 'body',
            type: service_types_1.ParameterType.STRING,
            label: 'Body',
            description: 'Email body content',
            required: true,
        },
        {
            name: 'body_type',
            type: service_types_1.ParameterType.STRING,
            label: 'Body type',
            description: 'text/plain or text/html (default text/plain)',
            required: false,
        },
    ];
    async execute(sconf, params) {
        const token = sconf?.config?.google_access_token;
        if (typeof token !== 'string' || !token) {
            throw new Error('Missing Google access token in service config (google_access_token). Ensure the user connected with Google and token is stored for this service.');
        }
        const to = params.to?.value && typeof params.to.value === 'string'
            ? params.to.value
            : null;
        const subject = params.subject?.value && typeof params.subject.value === 'string'
            ? params.subject.value
            : null;
        const body = params.body?.value && typeof params.body.value === 'string'
            ? params.body.value
            : null;
        const bodyType = params.body_type?.value && typeof params.body_type.value === 'string'
            ? params.body_type.value
            : 'text/plain';
        if (bodyType !== 'text/plain' && bodyType !== 'text/html') {
            throw new Error('Invalid body_type. Must be text/plain or text/html');
        }
        if (!to || !subject || !body) {
            throw new Error('Missing required parameters: to, subject or body');
        }
        const cleanTo = to.replace(/[\r\n]+/g, '');
        const cleanSubject = subject.replace(/[\r\n]+/g, '');
        const cleanBodyType = bodyType.replace(/[\r\n]+/g, '');
        const headers = [
            `To: ${cleanTo}`,
            `Subject: ${cleanSubject}`,
            `MIME-Version: 1.0`,
            `Content-Type: ${cleanBodyType}; charset="UTF-8"`,
        ];
        const raw = headers.join('\r\n') + '\r\n\r\n' + body;
        const base64 = Buffer.from(raw, 'utf8')
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ raw: base64 }),
        });
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Gmail API error: ${res.status} ${text}`);
        }
    }
    reload_cache(_sconf) {
        return Promise.resolve({});
    }
}
exports.SendEmailReaction = SendEmailReaction;
//# sourceMappingURL=send-email.reaction.js.map