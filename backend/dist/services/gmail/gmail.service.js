"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const send_email_reaction_1 = require("./reactions/send-email.reaction");
class GmailService {
    name = 'gmail';
    label = 'Gmail';
    description = 'Send emails on behalf of a user authenticated via Google OAuth';
    actions = [];
    reactions = [send_email_reaction_1.SendEmailReaction];
}
exports.default = GmailService;
//# sourceMappingURL=gmail.service.js.map