import { readdirSync } from 'fs';
import { join } from 'path';
import { DynamicModule, Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { ServiceImporterService } from './service_importer.service';

@Module({})
export class ServiceImporterModule {
  static register(): DynamicModule {
    const pluginPath = join(__dirname, '../../services');
    const dirs = readdirSync(pluginPath, { withFileTypes: true });

    const discoveredServices: any[] = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      // Try to require the service file (try both .service and module filenames)
      const serviceFileBase = join(pluginPath, dir.name, `${dir.name}.service`);
      const moduleFile = join(pluginPath, dir.name, `${dir.name}.module`);

      try {
        // Prefer requiring the service implementation file (no extension) so Node/ts-node resolves .ts/.js
        const importedService = require(serviceFileBase);
        // default export or named export with same name
        const svc =
          importedService.default ??
          importedService[Object.keys(importedService)[0]];
        if (svc) discoveredServices.push(svc);
        else
          console.warn(
            `[service] ${dir.name} ignored (no valid service export found)`,
          );
      } catch (errService) {
        try {
          // Fallback: try to require the module file and attempt to read a provider out of it
          const importedModule = require(moduleFile);
          // Nothing else to do here; modules may register providers themselves but we will not rely on that
        } catch (errModule) {
          console.warn(
            `[service] ${dir.name} ignored (no service or module file found)`,
          );
        }
      }
    }

    const serviceProvider = {
      provide: SERVICE_DEFINITION,
      useFactory: () => {
        return discoveredServices;
      },
    };

    console.log(
      `[service] Discovered services: ${discoveredServices.map((svc) => svc.name).join(', ')}`,
    );
    return {
      module: ServiceImporterModule,
      providers: [ServiceImporterService, serviceProvider],
      exports: [ServiceImporterService, serviceProvider],
    };
  }
}
