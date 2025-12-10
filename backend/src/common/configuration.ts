export default () => ({
  port: parseInt(process.env.PORT || '3000') || 3000,
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['*'],
  discordBotToken: process.env.DISCORD_BOT_TOKEN,
});
