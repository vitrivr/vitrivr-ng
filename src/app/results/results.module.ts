import {NgModule} from '@angular/core';
import {ListModule} from './list/list.module';
import {GalleryModule} from './gallery/gallery.module';
import {FeatureDetailsComponent} from './feature-details.component';
import {BrowserModule} from '@angular/platform-browser';
import {HistoryComponent} from './history.component';
import {MaterialModule} from '../material.module';
import {TemporalListModule} from './temporal/temporal-list.module';
import {VgCoreModule} from '@videogular/ngx-videogular/core';

@NgModule({
  imports: [GalleryModule, ListModule, TemporalListModule, BrowserModule, MaterialModule, VgCoreModule],
  declarations: [FeatureDetailsComponent, HistoryComponent],
  exports: [GalleryModule, ListModule, TemporalListModule],
})
export class ResultsModule {
}
