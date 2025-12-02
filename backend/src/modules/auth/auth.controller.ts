import {ApiTags} from "@nestjs/swagger";
import {Controller, Param, Post, Body} from "@nestjs/common";
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
@ApiTags('auth')
@Controller('auth')
export default class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("oauth/:provider/authorize")
    authorize(@Param('provider') provider: string) {
        // Implementation for OAuth authorization
    }

    @Post("login")
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto.email, loginDto.password);
    }
}