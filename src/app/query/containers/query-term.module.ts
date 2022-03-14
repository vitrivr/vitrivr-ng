import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {ImageQueryTermModule} from './images/image-query-term.module';
import {AudioQueryTermModule} from './audio/audio-query-term.module';
import {M3DQueryTermModule} from './m3d/m3d-query-term.module';
import {MaterialModule} from '../../material.module';
import {TextQueryTermModule} from './text/text-query-term.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TagQueryTermModule} from './tag/tag-query-term.module';
import {SemanticQueryTermModule} from './semantic/semantic-query-term.module';
import {BoolQueryTermModule} from './bool/bool-query-term.module';
import {QueryTermComponent} from './query-term.component';
import {PoseQueryTermModule} from "./pose/pose-query-term.module";
import {MapQueryTermModule} from './map-query-term/map-query-term.module';

@NgModule({
  imports: [
    MaterialModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ImageQueryTermModule,
    AudioQueryTermModule,
    M3DQueryTermModule,
    TextQueryTermModule,
    TagQueryTermModule,
    SemanticQueryTermModule,
    BoolQueryTermModule,
    PoseQueryTermModule,
    MapQueryTermModule
  ],
  declarations: [QueryTermComponent],
  exports: [QueryTermComponent]
})

export class QueryTermModule {
}
