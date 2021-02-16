import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {ResolverService} from './resolver.service';
import {EventBusService} from './event-bus.service';
import {PingService} from './ping.service';
import {DatabaseService} from './database.service';
import {KeyboardService} from './keyboard.service';
import {NotificationService} from './notification.service';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [ResolverService, EventBusService, PingService, DatabaseService, KeyboardService, NotificationService]
})

export class BasicModule {
}
