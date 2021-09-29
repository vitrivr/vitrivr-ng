import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {SketchModule} from '../shared/components/sketch/sketch.module';
import {MaterialModule} from '../material.module';
import {QuerySidebarComponent} from './query-sidebar.component';
import {QueryContainerModule} from './containers/query-container.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, SketchModule, QueryContainerModule],
  declarations: [QuerySidebarComponent],
  exports: [QuerySidebarComponent]
})

export class QuerySidebarModule {
}
