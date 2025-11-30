import { Module } from '@nestjs/common';
import {ExecutorService} from "./executor.service";

@Module({
    controllers: [],
    providers: [ExecutorService],
})
export class ExecutorModule {}
