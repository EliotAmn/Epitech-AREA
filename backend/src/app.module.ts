import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import {UserModule} from "./user/user.module";
import {PrismaModule} from "./prisma/prisma.module";
import {AuthModule} from "./modules/auth/auth.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            load: [configuration],
        }),
        PrismaModule,
        UserModule,
        AuthModule,
    ],
})
export class AppModule {}