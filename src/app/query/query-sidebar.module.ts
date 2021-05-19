import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {SketchModule} from '../shared/components/sketch/sketch.module';
import {MaterialModule} from '../material.module';
import {QuerySidebarComponent} from './query-sidebar.component';
import {QueryContainerModule} from './containers/query-container.module';
import {TemporalDistanceModule} from './temporal-distance/temporal-distance.module';
import {TemporalModeContainerModule} from './temporal-mode/temporal-mode-container.module';
import {TemporalLengthContainerModule} from './temporal-sequence-length/temporal-length-container.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, SketchModule, QueryContainerModule, TemporalDistanceModule, TemporalModeContainerModule, TemporalLengthContainerModule],
  declarations: [QuerySidebarComponent],
  exports: [QuerySidebarComponent]
})

export class QuerySidebarModule {
}
