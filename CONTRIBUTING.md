# Contributing to AÉRA

Thanks for your interest in contributing! This document describes the preferred workflow and expectations for contributions to this repository.

## Table of Contents

1. How to contribute
2. Branching & naming conventions
3. Pull request process
4. Code style & linters
5. Commit messages
6. Reporting issues
7. Local development guidelines
8. Contact

---

## 1. How to contribute

- Fork the repository (if you don't have push access) and create a feature branch.
- Keep changes small and focused — one logical change per PR.
- Ensure linters and formatters run cleanly before creating a PR.

---

## 2. Branching & naming conventions

Use clear branch names. Examples:

- `feat/<part>/<short-description>` — new features
- `fix/<part>/<short-description>` — bug fixes
- `chore/<part>/<short-description>` — chores, dependency bumps
- `refactor/<part>/<short-description>` — refactors

<part> = `backend`, `web`, `mobile`, or leave empty for cross-cutting changes.

Commit early and often; squash or tidy history before merging if appropriate.

---

## 3. Pull request process

- Open a PR against `dev` from your feature branch.
- Use a descriptive PR title and include a short summary of the changes.
- Link related issues (if any) in the PR description.
- Add reviewers and wait for approvals. At least two approvals are required.
- Ensure CI passes (tests, linting) before merging.

---

## 4. Code style & linters

- Follow the project's ESLint and Prettier configuration.
- Run linters locally and fix warnings/errors before pushing.
- Use TypeScript types where available; avoid `any` unless justified and documented.

Suggested commands (run from the relevant folder):

```bash
npm run lint
npm run format
```

---

## 5. Commit messages

Use concise, meaningful commit messages. Prefer Conventional Commits style:

```
feat(auth): add remember-me option
fix(profile): show real user name
chore(deps): bump axios to 1.3.0
```

---

## 6. Reporting issues

When reporting a bug or enhancement, include:

- A clear title
- Steps to reproduce
- Expected vs actual behavior
- Any relevant logs or screenshots (if applicable)
- Environment (OS, Node version, commands run, if relevant)

---

## 7. Local development guidelines

- Use environment variables and `.env` files for secrets and endpoints. Do not commit secrets to the repo.
- Prefer Docker for running databases and other dependencies locally for parity with CI.
- Keep UI changes small and accessible. Use Tailwind classes already adopted in the codebase.

---

## 8. Creating a new service

Services are integrations with external platforms (Spotify, Gmail, Twitch, etc.) that provide **actions** (triggers) and **reactions** (automated responses).

### 8.1. Service structure

Each service lives in `backend/src/services/<service-name>/` with the following structure:

```
backend/src/services/<service-name>/
├── <service-name>.service.ts    # Main service definition
├── <service-name>.module.ts     # NestJS module (optional, for complex services)
├── actions/                     # Action definitions (triggers)
│   └── <action-name>.ts
└── reactions/                   # Reaction definitions (automated responses)
    └── <reaction-name>.ts
```

### 8.2. Creating the service definition

Create `<service-name>.service.ts` implementing the `ServiceDefinition` interface:

```typescript
import { ServiceDefinition } from '@/common/service.types';
import { buildServiceRedirectUrl, buildUrlParameters } from '@/common/tools';
import { MyAction } from './actions/my-action';
import { MyReaction } from './reactions/my-reaction';

async function oauth_callback(
  userService: UserService,
  params: { [key: string]: string },
): Promise<boolean> {
  const authorizationCode = params.code as string | undefined;
  if (!authorizationCode) {
    throw new BadRequestException('Authorization code is missing');
  }

  // Exchange authorization code for access/refresh tokens
  const response = await axios.post('https://api.example.com/token', {
    code: authorizationCode,
    client_id: process.env.SERVICE_CLIENT_ID,
    client_secret: process.env.SERVICE_CLIENT_SECRET,
    redirect_uri: buildServiceRedirectUrl('service-name'),
    grant_type: 'authorization_code',
  });

  // Store tokens in userService
  userService.access_token = response.data.access_token;
  userService.refresh_token = response.data.refresh_token;
  userService.token_expires_at = new Date(Date.now() + response.data.expires_in * 1000);

  return true;
}

export default class MyService implements ServiceDefinition {
  name = 'service-name';              // Unique identifier (lowercase, no spaces)
  label = 'Service Name';             // Display name
  color = '#FF5733';                  // Brand color (hex)
  logo = 'https://example.com/logo.png'; // Logo URL
  description = 'Description of what this service does';
  mandatory_env_vars = ['SERVICE_CLIENT_ID', 'SERVICE_CLIENT_SECRET'];
  
  // OAuth configuration (if the service uses OAuth)
  oauth_url = buildUrlParameters('https://api.example.com/authorize', {
    client_id: process.env.SERVICE_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: buildServiceRedirectUrl('service-name'),
    scope: 'read write',
  });
  oauth_callback = oauth_callback;

  // Register actions and reactions
  actions = [MyAction];
  reactions = [MyReaction];
}
```

### 8.3. Creating an action (trigger)

Actions monitor external services and trigger when specific events occur. Create `actions/<action-name>.ts`:

```typescript
import { Logger } from '@nestjs/common';
import { ServiceActionDefinition, ParameterType } from '@/common/service.types';
import type { ActionTriggerOutput, ParameterDefinition, ServiceConfig } from '@/common/service.types';

const logger = new Logger('MyService');

export class MyAction extends ServiceActionDefinition {
  name = 'service-name.action_name';
  label = 'On Event Occurs';
  description = 'Triggered when a specific event occurs';
  poll_interval = 60; // Poll every 60 seconds (0 = no polling)

  // Parameters that users can configure
  input_params: ParameterDefinition[] = [
    {
      name: 'filter',
      type: ParameterType.SELECT,
      label: 'Filter events',
      description: 'Choose which events to monitor',
      required: true,
      options: [
        { label: 'All', value: 'all' },
        { label: 'Important only', value: 'important' },
      ],
    },
  ];

  // Data provided to reactions when triggered
  output_params: ParameterDefinition[] = [
    {
      name: 'event_title',
      type: ParameterType.STRING,
      label: 'Event Title',
      description: 'The title of the event',
      required: true,
    },
  ];

  // Initialize cache (stores state between polls)
  async reload_cache(sconf: ServiceConfig): Promise<Record<string, unknown>> {
    return { lastEventId: null };
  }

  // Poll for new events
  async poll(sconf: ServiceConfig): Promise<ActionTriggerOutput> {
    const accessToken = sconf.config.access_token as string | undefined;
    if (!accessToken) {
      return { triggered: false, parameters: {} };
    }

    const lastEventId = sconf.cache?.lastEventId as string | null;

    // Fetch latest events from API
    const response = await axios.get('https://api.example.com/events', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const latestEvent = response.data.events[0];
    
    // Check if this is a new event
    if (latestEvent && latestEvent.id !== lastEventId) {
      return {
        triggered: true,
        parameters: {
          event_title: { type: ParameterType.STRING, value: latestEvent.title },
        },
        cache: { lastEventId: latestEvent.id },
      };
    }

    return { triggered: false, parameters: {} };
  }
}
```

### 8.4. Creating a reaction (automated response)

Reactions execute automated tasks. Create `reactions/<reaction-name>.ts`:

```typescript
import { Logger } from '@nestjs/common';
import { ServiceReactionDefinition, ParameterType } from '@/common/service.types';
import type { ParameterDefinition, ParameterValue, ServiceConfig } from '@/common/service.types';

const logger = new Logger('MyService');

export class MyReaction extends ServiceReactionDefinition {
  name = 'service-name.reaction_name';
  label = 'Perform Action';
  description = 'Performs an action on the service';

  input_params: ParameterDefinition[] = [
    {
      name: 'message',
      type: ParameterType.STRING,
      label: 'Message',
      description: 'The message to send',
      required: true,
    },
    {
      name: 'priority',
      type: ParameterType.SELECT,
      label: 'Priority',
      description: 'Message priority level',
      required: false,
      options: [
        { label: 'Low', value: 'low' },
        { label: 'High', value: 'high' },
      ],
    },
  ];

  async reload_cache(sconf?: ServiceConfig): Promise<Record<string, unknown>> {
    return {};
  }

  async execute(
    sconf: ServiceConfig,
    params: Record<string, ParameterValue>,
  ): Promise<void> {
    const accessToken = sconf.config.access_token as string | undefined;
    const message = params.message?.value as string;
    const priority = params.priority?.value as string || 'low';

    if (!accessToken) {
      throw new Error('No access token available');
    }

    logger.debug(`Executing action with message: ${message}`);

    // Call external API
    await axios.post('https://api.example.com/send', {
      message,
      priority,
    }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    logger.log('Action executed successfully');
  }
}
```

### 8.5. Service auto-discovery

The `ServiceImporterModule` automatically discovers services by scanning `backend/src/services/`. Just create your service directory and files—no manual registration needed!

### 8.6. Environment variables

Add required environment variables to `.env`:

```bash
SERVICE_CLIENT_ID=your_client_id
SERVICE_CLIENT_SECRET=your_client_secret
```

List them in `mandatory_env_vars` in your service definition to validate they're present at startup.

### 8.7. Parameter types

Available parameter types in `ParameterType`:
- `STRING` - Text input
- `NUMBER` - Numeric input
- `BOOLEAN` - True/false checkbox
- `SELECT` - Dropdown with predefined options

### 8.8. Testing your service

1. Add environment variables to `.env`
2. Start the backend: `npm run start:dev`
3. Check logs for service registration: `[service] service-name registered`
4. Test OAuth flow via frontend or `/about.json` endpoint
5. Create an AREA using your action/reaction

### 8.9. Best practices

- Use proper TypeScript types—avoid `any`
- Add debug logging with `Logger`
- Handle errors gracefully (expired tokens, API failures)
- Store minimal state in cache—it's per-user and in-memory
- Validate parameters before executing reactions
- Use polling intervals wisely (don't DDoS external APIs)
- Document OAuth scopes needed in service description

---

## 9. Contact

If you're unsure where to start, open an issue with the label `good first issue` and a maintainer will help prioritize it.

Thanks for contributing — we appreciate your help making AÉRA better!
