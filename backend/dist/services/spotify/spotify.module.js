"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyModule = void 0;
const common_1 = require("@nestjs/common");
const consts_1 = require("../../common/consts");
const userservice_module_1 = require("../../modules/user_service/userservice.module");
const spotify_service_1 = __importDefault(require("./spotify.service"));
let SpotifyModule = class SpotifyModule {
};
exports.SpotifyModule = SpotifyModule;
exports.SpotifyModule = SpotifyModule = __decorate([
    (0, common_1.Module)({
        imports: [userservice_module_1.UserServiceModule],
        providers: [
            {
                provide: consts_1.SERVICE_DEFINITION,
                useClass: spotify_service_1.default,
            },
        ],
        exports: [consts_1.SERVICE_DEFINITION],
    })
], SpotifyModule);
//# sourceMappingURL=spotify.module.js.map