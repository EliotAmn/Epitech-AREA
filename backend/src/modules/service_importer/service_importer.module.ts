import { readdirSync } from 'fs';
import { join } from 'path';
import { DynamicModule, Module } from '@nestjs/common';

import { SERVICE_DEFINITION } from '@/common/consts';
import { ServiceDefinition } from '@/common/service.types';
import { ServiceImporterService } from './service_importer.service';

interface ServiceModule {
  default?: new () => ServiceDefinition;
  [key: string]: unknown;
}

@Module({})
export class ServiceImporterModule {
  static async register(): Promise<DynamicModule> {
    const pluginPath = join(__dirname, '../../services');
    const dirs = readdirSync(pluginPath, { withFileTypes: true });

    const discoveredServices: Array<new () => ServiceDefinition> = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      // Try to require the service file (try both .service and module filenames)
      const serviceFileBase = join(pluginPath, dir.name, `${dir.name}.service`);
      const moduleFile = join(pluginPath, dir.name, `${dir.name}.module`);

      try {
        // Prefer importing the service implementation file so Node/ts-node resolves .ts/.js

        const importedService = (await import(
          serviceFileBase
        )) as ServiceModule;

        // default export or named export with same name
        const svc =
          importedService.default ??
          (Object.keys(importedService)[0]
            ? (importedService[Object.keys(importedService)[0]] as new () =>
                | ServiceDefinition
                | undefined)
            : undefined);

        if (svc && typeof svc === 'function') {
          discoveredServices.push(svc as new () => ServiceDefinition);
        } else {
          console.warn(
            `[service] ${dir.name} ignored (no valid service export found)`,
          );
        }
      } catch {
        try {
          // Fallback: try to import the module file and attempt to read a provider out of it

          const _importedModule = (await import(moduleFile)) as ServiceModule;
          // Nothing else to do here; modules may register providers themselves but we will not rely on that
        } catch {
          console.warn(
            `[service] ${dir.name} ignored (no service or module file found)`,
          );
        }
      }
    }

    const serviceProvider = {
      provide: SERVICE_DEFINITION,
      useFactory: (): Array<new () => ServiceDefinition> => {
        return discoveredServices;
      },
    };

    console.log(
      `[service] Discovered services: ${discoveredServices
        .map((ServiceClass) => {
          try {
            const instance = new ServiceClass();
            return instance.name;
          } catch {
            return 'unknown';
          }
        })
        .join(', ')}`,
    );

    return {
      module: ServiceImporterModule,
      providers: [ServiceImporterService, serviceProvider],
      exports: [ServiceImporterService, serviceProvider],
    };
  }
}
