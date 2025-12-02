import { Module } from '@nestjs/common';
import AuthController from "./auth.controller";
import {PasswordModule} from "../common/password/password.module";
import {UserModule} from "../user/user.module";
import {AuthService} from "./auth.service";
import {PasswordService} from "../common/password/password.service";

@Module({
    imports: [UserModule, PasswordModule],
   controllers: [AuthController],
   providers: [AuthService, PasswordService],
})
export class AuthModule {}
