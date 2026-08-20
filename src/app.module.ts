import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, type TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv, type Env } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): TypeOrmModuleOptions => {
        const host = config.get('DB_HOST', { infer: true });
        const port = config.get('DB_PORT', { infer: true });
        const username = config.get('DB_USERNAME', { infer: true });
        const password = config.get('DB_PASSWORD', { infer: true });
        const database = config.get('DB_NAME', { infer: true });
        const isDev = config.get('NODE_ENV', { infer: true }) === 'development';

        return {
          type: 'mysql',
          host,
          port,
          username,
          password,
          database,
          autoLoadEntities: true,
          synchronize: false,
          logging: isDev,
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
