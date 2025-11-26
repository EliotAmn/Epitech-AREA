export interface CatalogItem {
  id: string;
  titre: string;
  plateforme: string;
  color?: string;
  path?: string;
}

export const actions: CatalogItem[] = [
  { id: 'a1', titre: 'Create Google Calendar Event', plateforme: 'Google Calendar', color: '#3b82f6', path: '/action/create-calendar' },
  { id: 'a2', titre: 'Send Slack Message', plateforme: 'Slack', color: '#36C5F0', path: '/action/send-slack' },
  { id: 'a3', titre: 'Save Tweet to Notion', plateforme: 'Notion', color: '#000000', path: '/action/save-tweet' },
  { id: 'a4', titre: 'Upload File to Dropbox', plateforme: 'Dropbox', color: '#0061FF', path: '/action/upload-dropbox' },
  { id: 'a5', titre: 'Create Trello Card', plateforme: 'Trello', color: '#0079BF', path: '/action/create-trello' },
];

export const reactions: CatalogItem[] = [
  { id: 'r1', titre: 'Post Message in Slack', plateforme: 'Slack', color: '#36C5F0', path: '/reaction/post-slack' },
  { id: 'r2', titre: 'Send Email via SMTP', plateforme: 'Email', color: '#EA4335', path: '/reaction/send-email' },
  { id: 'r3', titre: 'Create Todo in Todoist', plateforme: 'Todoist', color: '#FF6A00', path: '/reaction/create-todoist' },
  { id: 'r4', titre: 'Add Row to Google Sheets', plateforme: 'Google Sheets', color: '#0F9D58', path: '/reaction/add-sheets-row' },
  { id: 'r5', titre: 'Trigger Webhook', plateforme: 'Webhook', color: '#8A2BE2', path: '/reaction/trigger-webhook' },
];

export const services: CatalogItem[] = [
    { id: 's1', titre: 'Google Calendar', plateforme: 'Google', color: '#3b82f6', path: '/service/google-calendar' },
    { id: 's2', titre: 'Slack', plateforme: 'Slack', color: '#36C5F0', path: '/service/slack' },
    { id: 's3', titre: 'Notion', plateforme: 'Notion', color: '#000000', path: '/service/notion' },
    { id: 's4', titre: 'Dropbox', plateforme: 'Dropbox', color: '#0061FF', path: '/service/dropbox' },
    { id: 's5', titre: 'Trello', plateforme: 'Trello', color: '#0079BF', path: '/service/trello' },
    ];
