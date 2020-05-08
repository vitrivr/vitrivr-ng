import {NgModule} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {BrowserModule} from '@angular/platform-browser';
import {QueryStageComponent} from './query-stage.component';
import {QueryTermModule} from './query-term.module';

@NgModule({
  imports: [
    MaterialModule,
    BrowserModule,
    QueryTermModule,
  ],
  declarations: [QueryStageComponent],
  exports: [QueryStageComponent]
})

export class QueryStageModule {
}
