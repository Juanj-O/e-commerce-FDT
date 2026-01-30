import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const isLocalhost =
    configService.get<string>('DATABASE_HOST') === 'localhost';

  // Parse DATABASE_URL if provided
  if (databaseUrl && !isLocalhost) {
    const url = new URL(databaseUrl);
    return {
      type: 'postgres',
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      username: url.username,
      password: url.password,
      database: url.pathname.slice(1), // Remove leading slash
      entities: [
        __dirname +
          '/../adapters/outbound/persistence/typeorm/entities/*.orm-entity{.ts,.js}',
      ],
      synchronize: configService.get<string>('NODE_ENV') !== 'production',
      logging: configService.get<string>('NODE_ENV') === 'development',
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  // Otherwise, use individual parameters
  const baseConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'localhost'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USER', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD', 'postgres123'),
    database: configService.get<string>('DATABASE_NAME', 'ecommerce'),
    entities: [
      __dirname +
        '/../adapters/outbound/persistence/typeorm/entities/*.orm-entity{.ts,.js}',
    ],
    synchronize: configService.get<string>('NODE_ENV') !== 'production',
    logging: configService.get<string>('NODE_ENV') === 'development',
  };

  // Add SSL configuration for remote databases
  if (!isLocalhost) {
    return {
      ...baseConfig,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  return baseConfig;
};
