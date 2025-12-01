export interface CatalogItem {
  id: string;
  title: string;
  platform: string;
  color?: string;
  path?: string;
}

export const actions: CatalogItem[] = [
  { id: 'a1', title: 'Create Google Calendar Event', platform: 'Google Calendar', color: '#3b82f6', path: '/action/create-calendar' },
  { id: 'a2', title: 'Send Slack Message', platform: 'Slack', color: '#36C5F0', path: '/action/send-slack' },
  { id: 'a3', title: 'Save Tweet to Notion', platform: 'Notion', color: '#000000', path: '/action/save-tweet' },
  { id: 'a4', title: 'Upload File to Dropbox', platform: 'Dropbox', color: '#0061FF', path: '/action/upload-dropbox' },
  { id: 'a5', title: 'Create Trello Card', platform: 'Trello', color: '#0079BF', path: '/action/create-trello' },
];

export const reactions: CatalogItem[] = [
  { id: 'r1', title: 'Post Message in Slack', platform: 'Slack', color: '#36C5F0', path: '/reaction/post-slack' },
  { id: 'r2', title: 'Send Email via SMTP', platform: 'Email', color: '#EA4335', path: '/reaction/send-email' },
  { id: 'r3', title: 'Create Todo in Todoist', platform: 'Todoist', color: '#FF6A00', path: '/reaction/create-todoist' },
  { id: 'r4', title: 'Add Row to Google Sheets', platform: 'Google Sheets', color: '#0F9D58', path: '/reaction/add-sheets-row' },
  { id: 'r5', title: 'Trigger Webhook', platform: 'Webhook', color: '#8A2BE2', path: '/reaction/trigger-webhook' },
];

export const services: CatalogItem[] = [
    { id: 's1', title: 'Google Calendar', platform: 'Google', color: '#3b82f6', path: '/service/google-calendar' },
    { id: 's2', title: 'Slack', platform: 'Slack', color: '#36C5F0', path: '/service/slack' },
    { id: 's3', title: 'Notion', platform: 'Notion', color: '#000000', path: '/service/notion' },
    { id: 's4', title: 'Dropbox', platform: 'Dropbox', color: '#0061FF', path: '/service/dropbox' },
    { id: 's5', title: 'Trello', platform: 'Trello', color: '#0079BF', path: '/service/trello' },
    ];
