"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ServiceImporterModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceImporterModule = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const common_1 = require("@nestjs/common");
const consts_1 = require("../../common/consts");
const service_importer_service_1 = require("./service_importer.service");
let ServiceImporterModule = ServiceImporterModule_1 = class ServiceImporterModule {
    static register() {
        const pluginPath = (0, path_1.join)(__dirname, '../../services');
        const dirs = (0, fs_1.readdirSync)(pluginPath, { withFileTypes: true });
        const discoveredServices = [];
        for (const dir of dirs) {
            if (!dir.isDirectory())
                continue;
            const serviceFileBase = (0, path_1.join)(pluginPath, dir.name, `${dir.name}.service`);
            const moduleFile = (0, path_1.join)(pluginPath, dir.name, `${dir.name}.module`);
            try {
                const importedService = require(serviceFileBase);
                const svc = importedService.default ??
                    (Object.keys(importedService)[0]
                        ? importedService[Object.keys(importedService)[0]]
                        : undefined);
                if (svc && typeof svc === 'function') {
                    discoveredServices.push(svc);
                }
                else {
                    console.warn(`[service] ${dir.name} ignored (no valid service export found)`);
                }
            }
            catch {
                try {
                    const _importedModule = require(moduleFile);
                }
                catch {
                    console.warn(`[service] ${dir.name} ignored (no service or module file found)`);
                }
            }
        }
        const serviceProvider = {
            provide: consts_1.SERVICE_DEFINITION,
            useFactory: () => {
                return discoveredServices.map((Svc) => new Svc());
            },
        };
        return {
            module: ServiceImporterModule_1,
            providers: [serviceProvider, service_importer_service_1.ServiceImporterService],
            exports: [serviceProvider, service_importer_service_1.ServiceImporterService],
        };
    }
};
exports.ServiceImporterModule = ServiceImporterModule;
exports.ServiceImporterModule = ServiceImporterModule = ServiceImporterModule_1 = __decorate([
    (0, common_1.Module)({})
], ServiceImporterModule);
//# sourceMappingURL=service_importer.module.js.map