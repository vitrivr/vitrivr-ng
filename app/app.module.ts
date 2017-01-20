import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent}  from './app.component';
import {Configuration} from "./configuration/app.config";
import {GalleryModule} from "./views/gallery/gallery.module";

import 'hammerjs';
import {ResearchModule} from "./views/research/research.module";
import {QueryService} from "./services/queries/queries.service";
import {CineastAPI} from "./services/api/cineast-api.service";
import {PingComponent} from "./views/ping/ping.component";

@NgModule({
  imports:      [ BrowserModule, FormsModule,  MaterialModule.forRoot(), GalleryModule, ResearchModule ],
  declarations: [ AppComponent, PingComponent ],
  providers:    [ Configuration, QueryService, CineastAPI ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }
