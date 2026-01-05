import { AboutService } from './about.service';
import type { AboutResponse } from './about.service';
export declare class AboutController {
    private readonly aboutService;
    constructor(aboutService: AboutService);
    getAbout(clientIp: string): AboutResponse;
}
