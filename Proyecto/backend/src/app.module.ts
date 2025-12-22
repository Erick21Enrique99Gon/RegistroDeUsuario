import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SistemaModules } from './infrastructure/sistema.modules';

@Module({
  imports: [SistemaModules],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
