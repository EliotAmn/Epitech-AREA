import {ApiTags} from "@nestjs/swagger";
import {Controller} from "@nestjs/common";

@ApiTags('auth')
@Controller('auth')
export default class AuthController {

}