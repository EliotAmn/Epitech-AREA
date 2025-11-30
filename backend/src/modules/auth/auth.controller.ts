import {ApiTags} from "@nestjs/swagger";
import {Controller, Param, Post} from "@nestjs/common";

@ApiTags('auth')
@Controller('auth')
export default class AuthController {
    @Post("oauth/:provider/authorize")
    authorize(@Param('provider') provider: string) {
        // Implementation for OAuth authorization
    }

    @Post("login")
    login() {
                
    }
}