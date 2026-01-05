"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
const configuration_1 = __importDefault(require("./common/configuration"));
const area_service_1 = require("./modules/area/area.service");
const discord_client_1 = require("./services/discord/discord.client");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('AREA API')
        .setDescription('API documentation for AREA backend')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const allowedOrigins = (0, configuration_1.default)().allowedOrigins;
    app.enableCors({
        origin: allowedOrigins.includes('*') ? true : allowedOrigins,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    const documentFactory = () => swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, documentFactory);
    const discordToken = (0, configuration_1.default)().discordBotToken;
    if (discordToken) {
        try {
            logger.log('Initializing Discord bot...');
            await discord_client_1.DiscordClientManager.getInstance().initialize(discordToken);
            logger.log('Discord bot initialized successfully');
        }
        catch (error) {
            logger.error('Failed to initialize Discord bot:', error);
            logger.warn('Discord service will not be available');
        }
    }
    else {
        logger.warn('DISCORD_BOT_TOKEN not found in environment variables. Discord service will not be available.');
    }
    try {
        const areaService = app.get(area_service_1.AreaService);
        if (areaService && typeof areaService.initializeAll === 'function') {
            logger.log('Initializing existing areas...');
            await areaService.initializeAll();
            logger.log('Areas initialized');
        }
    }
    catch (err) {
        logger.error('Failed to initialize areas at startup:', err);
    }
    await app.listen(process.env.PORT || 3000);
}
bootstrap().catch((error) => {
    console.error('Failed to start application:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map