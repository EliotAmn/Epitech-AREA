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
  static register(): DynamicModule {
    const pluginPath = join(__dirname, '../../services');
    const dirs = readdirSync(pluginPath, { withFileTypes: true });

    const discoveredServices: Array<new () => ServiceDefinition> = [];

    for (const dir of dirs) {
      if (!dir.isDirectory()) continue;

      // Try to require the service file (try both .service and module filenames)
      const serviceFileBase = join(pluginPath, dir.name, `${dir.name}.service`);
      const moduleFile = join(pluginPath, dir.name, `${dir.name}.module`);

      try {
        // Prefer requiring the service implementation file so Node/ts-node resolves .ts/.js
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const importedService = require(serviceFileBase) as ServiceModule;

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
          // Fallback: try to require the module file
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const _importedModule = require(moduleFile) as ServiceModule;
          // Nothing else to do here; modules may register providers themselves
        } catch {
          console.warn(
            `[service] ${dir.name} ignored (no service or module file found)`,
          );
        }
      }
    }

    const serviceProvider = {
      provide: SERVICE_DEFINITION,
      // Provide actual ServiceDefinition instances (not constructors) so
      // consumers of the token can access .actions/.reactions directly.
      useFactory: (): ServiceDefinition[] => {
        return discoveredServices.map((Svc) => new Svc());
      },
    };

    // Discovered services are provided via the SERVICE_DEFINITION provider.

    return {
      module: ServiceImporterModule,
      // Ensure the service definitions provider is registered before the
      // ServiceImporterService so the injected token is available when the
      // service is instantiated.
      providers: [serviceProvider, ServiceImporterService],
      exports: [serviceProvider, ServiceImporterService],
    };
  }
}
