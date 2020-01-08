import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {ConfigService} from './config.service';
import {ResolverService} from './resolver.service';
import {EventBusService} from './event-bus.service';
import {PingService} from './ping.service';
import {DatabaseService} from './database.service';
import {KeyboardService} from './keyboard.service';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [ConfigService, ResolverService, EventBusService, PingService, DatabaseService, KeyboardService]
})

export class BasicModule {
}
