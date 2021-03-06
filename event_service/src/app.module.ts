import { Module, HttpModule, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GeocodeController } from './geocode/geocode.controller';
import { EventController } from './event/event.controller';
import { GeocodeService } from '../src/geocode/geocode.service';
import { EventService } from './event/event.service';
import { GeocodeModule } from './geocode/geocode.module';
import { EventModule } from './event/event.module';
import { GeocodeDAL } from './DAL/geocodeDAL';
import { GeocodeDALModule } from './DAL/geocodeDAL.module';
import { EventDALModule } from './DAL/eventDAL.module';
import { EventDAL } from './DAL/eventDAL';

@Module({
  imports: [HttpModule, GeocodeModule, EventModule, GeocodeDALModule, EventDALModule],
  controllers: [GeocodeController, EventController, AppController],
  providers: [GeocodeService, EventService, AppService, GeocodeDAL, EventDAL],
})
export class AppModule {
  constructor(private readonly appService: AppService) {}
  
}
