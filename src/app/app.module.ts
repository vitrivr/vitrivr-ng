

import {NgModule} from '@angular/core';
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
import {EvaluationModule} from './evaluation/evaluation.module';
import {MaterialModule} from './material.module';
import {ResultsModule} from './results/results.module';
import {MatBadgeModule} from '@angular/material/badge';
import { GoogleChartsModule } from 'angular-google-charts';


@NgModule({
  imports: [
    CoreModule,
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    ResultsModule,
    EvaluationModule,
    ObjectdetailsModule,
    SettingsModule,
    QuerySidebarModule,
    MatBadgeModule,
    GoogleChartsModule.forRoot({ version: '49' })
  ],
  declarations: [AppComponent, PingComponent],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule {
}
