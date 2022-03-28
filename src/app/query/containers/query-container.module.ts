import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {QueryContainerComponent} from './query-container.component';
import {ImageQueryTermModule} from './images/image-query-term.module';
import {AudioQueryTermModule} from './audio/audio-query-term.module';
import {M3DQueryTermModule} from './m3d/m3d-query-term.module';
import {MaterialModule} from '../../material.module';
import {TextQueryTermModule} from './text/text-query-term.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TagQueryTermModule} from './tag/tag-query-term.module';
import {SemanticQueryTermModule} from './semantic/semantic-query-term.module';
import {BoolQueryTermModule} from './bool/bool-query-term.module';
import {QueryStageModule} from './query-stage.module';
import {TemporalDistanceModule} from '../temporal-distance/temporal-distance.module';
import {PipesModule} from '../../shared/pipes/pipes.module';

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
    QueryStageModule,
    TemporalDistanceModule,
    PipesModule
  ],
  declarations: [QueryContainerComponent],
  exports: [QueryContainerComponent]
})

export class QueryContainerModule {
}
