import 'hammerjs';

import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent}  from './app.component';
import {GalleryModule} from "./gallery/gallery.module";
import {ResearchModule} from "./research/research.module";
import {PingComponent} from "./toolbar/ping.component";
import {CoreModule} from "./core/core.module";
import {FeaturesModule} from "./features/features.module";
import {ObjectdetailsModule} from "./objectdetails/objectdetails.module";
import {AppRoutingModule} from "./app-routing.module";


@NgModule({
  imports: [
      CoreModule,
      BrowserModule,
      FormsModule,
      MaterialModule.forRoot(),
      AppRoutingModule,
      GalleryModule,
      ObjectdetailsModule,
      ResearchModule,
      FeaturesModule
  ],
  declarations: [ AppComponent, PingComponent ],
  providers:    [ ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
