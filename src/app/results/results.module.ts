import {NgModule} from '@angular/core';
import {ListModule} from './list/list.module';
import {GalleryModule} from './gallery/gallery.module';
import {FeatureDetailsComponent} from './feature-details.component';
import {BrowserModule} from '@angular/platform-browser';
import {HistoryComponent} from './history.component';
import {MaterialModule} from '../material.module';

@NgModule({
    imports: [GalleryModule, ListModule, BrowserModule, MaterialModule],
    declarations: [FeatureDetailsComponent, HistoryComponent],
    exports: [GalleryModule, ListModule],
    entryComponents: [FeatureDetailsComponent, HistoryComponent]
})
export class ResultsModule {
}
