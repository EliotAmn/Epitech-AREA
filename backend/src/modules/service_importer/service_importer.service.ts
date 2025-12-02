import {Inject, Injectable} from "@nestjs/common";
import {ServiceDefinition} from "../../common/service.types";
import {SERVICE_DEFINITION} from "../../common/consts";

@Injectable()
export class ServiceImporterService {

    constructor(
        @Inject(SERVICE_DEFINITION)
        private readonly services: ServiceDefinition[],
    ) {}

    getAllServices() {
        return this.services;
    }

    getServiceByName(name: string): ServiceDefinition | undefined {
        return this.services.find(service => service.name === name);
    }


}