import {HttpClientModule} from '@angular/common/http';

import {APP_INITIALIZER, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {AppComponent} from './app.component';
import {QuerySidebarModule} from './query/query-sidebar.module';
import {PingComponent} from './toolbar/ping.component';
import {CoreModule} from './core/core.module';
import {SettingsModule} from './settings/settings.module';
import {ObjectdetailsModule} from './objectdetails/objectdetails.module';
import {AppRoutingModule} from './app-routing.module';
import {MaterialModule} from './material.module';
import {ResultsModule} from './results/results.module';
import {MatBadgeModule} from '@angular/material/badge';
import {AppConfig} from './app.config';
import {SegmentdetailsModule} from './segmentdetails/segmentdetails.module';
import {PipesModule} from './shared/pipes/pipes.module';

/**
 * Method used to laod the application config
 * @param appConfig The AppConfig service
 */
export function initializeConfig(appConfig: AppConfig) {
  return () => appConfig.load();
}

@NgModule({
  imports: [
    HttpClientModule,
    CoreModule,
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    ResultsModule,
    ObjectdetailsModule,
    SegmentdetailsModule,
    SettingsModule,
    QuerySidebarModule,
    MatBadgeModule,
    PipesModule
  ],
  declarations: [AppComponent, PingComponent],
  providers: [AppConfig, {provide: APP_INITIALIZER, useFactory: initializeConfig, deps: [AppConfig], multi: true}],
  bootstrap: [AppComponent]
})

export class AppModule {
}
