# Discord Service

Service d'intégration Discord pour la plateforme AREA avec support d'OAuth2 et bot Discord.

## 📋 Configuration

### Prérequis

1. Créer une application Discord sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créer un bot dans votre application
3. Activer les **Privileged Gateway Intents** suivants :
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`

### Variables d'environnement

Ajouter dans votre fichier `.env` :

```env
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
```

### Initialisation du Bot

Le bot Discord doit être initialisé au démarrage de l'application :

```typescript
import { DiscordClientManager } from './services/discord/discord.client';

// Au démarrage de l'application
await DiscordClientManager.getInstance().initialize(process.env.DISCORD_BOT_TOKEN);
```

### OAuth2 Scopes

Pour inviter le bot sur un serveur, l'URL d'OAuth doit inclure ces scopes :
- `bot`
- `applications.commands`

Et ces permissions :
- Read Messages/View Channels
- Send Messages
- Manage Roles
- Send Messages in Threads
- Read Message History

## 🎯 Actions Disponibles

### 1. New Message in Channel
**Nom:** `new_message_in_channel`

Déclenche quand un nouveau message est posté dans un canal spécifique.

**Configuration requise:**
```json
{
  "channel_id": "123456789012345678"
}
```

**Paramètres de sortie:**
- `message_content` (string) : Contenu du message
- `author` (string) : Nom d'utilisateur de l'auteur
- `channel_name` (string) : Nom du canal
- `timestamp` (string) : Date et heure du message (ISO 8601)

---

### 2. User Joined Server
**Nom:** `user_joined_server`

Déclenche quand un utilisateur rejoint le serveur Discord.

**Configuration requise:**
```json
{
  "guild_id": "123456789012345678"
}
```

**Paramètres de sortie:**
- `username` (string) : Nom d'utilisateur
- `user_id` (string) : ID Discord de l'utilisateur
- `account_created_at` (string) : Date de création du compte (ISO 8601)
- `joined_at` (string) : Date d'arrivée sur le serveur (ISO 8601)

---

### 3. Message Contains Keyword
**Nom:** `message_contains_keyword`

Déclenche quand un message contient un mot-clé spécifique (insensible à la casse).

**Configuration requise:**
```json
{
  "keyword": "hello",
  "channel_id": "123456789012345678"  // Optionnel : pour limiter à un canal
}
```

**Paramètres de sortie:**
- `message_content` (string) : Contenu complet du message
- `author` (string) : Nom d'utilisateur de l'auteur
- `keyword_found` (string) : Le mot-clé détecté
- `channel_name` (string) : Nom du canal

---

## ⚡ Réactions Disponibles

### 1. Send Message to Channel
**Nom:** `send_message_to_channel`

Envoie un message dans un canal Discord spécifique.

**Paramètres d'entrée:**
- `channel_id` (string, requis) : ID du canal Discord
- `message` (string, requis) : Contenu du message à envoyer

**Exemple:**
```json
{
  "channel_id": "123456789012345678",
  "message": "Hello from AREA! New user: $(username)"
}
```

---

### 2. Add Role to User
**Nom:** `add_role_to_user`

Ajoute un rôle à un utilisateur Discord spécifique.

**Paramètres d'entrée:**
- `user_id` (string, requis) : ID Discord de l'utilisateur
- `role_id` (string, requis) : ID du rôle à ajouter
- `guild_id` (string, requis) : ID du serveur Discord

**Exemple:**
```json
{
  "user_id": "123456789012345678",
  "role_id": "987654321098765432",
  "guild_id": "111222333444555666"
}
```

---

### 3. Send Direct Message
**Nom:** `send_direct_message`

Envoie un message privé à un utilisateur Discord.

**Paramètres d'entrée:**
- `user_id` (string, requis) : ID Discord de l'utilisateur
- `message` (string, requis) : Contenu du message à envoyer

**Exemple:**
```json
{
  "user_id": "123456789012345678",
  "message": "Welcome to our server, $(username)!"
}
```

---

## 🔧 Architecture

```
services/discord/
├── discord.client.ts          # Gestionnaire singleton du client Discord
├── discord.service.ts         # Définition du service
├── discord.module.ts          # Module NestJS
├── actions/
│   ├── new-message-in-channel.action.ts
│   ├── user-joined-server.action.ts
│   └── message-contains-keyword.action.ts
└── reactions/
    ├── send-message-to-channel.reaction.ts
    ├── add-role-to-user.reaction.ts
    └── send-direct-message.reaction.ts
```

## 📝 Notes Importantes

1. **Event-driven Architecture**: Les actions utilisent le système d'événements de Discord.js pour détecter les changements en temps réel plutôt que du polling.

2. **Handler Registration**: Chaque action enregistre ses propres handlers d'événements lors de l'appel à `reload_cache()`.

3. **Thread Safety**: Le gestionnaire de client Discord utilise un pattern singleton pour éviter les connexions multiples.
- `account_created_at` (string) : Date de création du compte (ISO 8601)

4. **Error Handling**: Toutes les méthodes incluent une gestion d'erreurs appropriée avec logs.

## 🚀 Exemple d'Utilisation AREA

**Scénario:** Envoyer un message de bienvenue quand un utilisateur rejoint le serveur

- **Action:** `user_joined_server`
  - Config: `{ "guild_id": "123..." }`
  
- **Reaction:** `send_message_to_channel`
  - Params: 
    ```json
    {
      "channel_id": "welcome_channel_id",
      "message": "Welcome $(username) to our server! 🎉"
    }
    ```

Le système remplacera automatiquement `$(username)` par le nom de l'utilisateur qui a rejoint le serveur.
