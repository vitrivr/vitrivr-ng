import {NgModule} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {BrowserModule} from '@angular/platform-browser';
import {QueryStageComponent} from './query-stage.component';
import {QueryTermModule} from './query-term.module';
import {PipesModule} from '../../shared/pipes/pipes.module';

@NgModule({
  imports: [
    MaterialModule,
    BrowserModule,
    QueryTermModule,
    PipesModule,
  ],
  declarations: [QueryStageComponent],
  exports: [QueryStageComponent]
})

export class QueryStageModule {
}
