import {NgModule}      from '@angular/core';
import {ListModule} from "./list/list.module";
import {GalleryModule} from "./gallery/gallery.module";
import {FeatureDetailsComponent} from "./feature-details.component";
import {BrowserModule} from "@angular/platform-browser";
@NgModule({
    imports:      [ GalleryModule, ListModule, BrowserModule ],
    declarations: [ FeatureDetailsComponent ],
    exports: [ GalleryModule, ListModule ],
    entryComponents: [ FeatureDetailsComponent ]
})
export class ResultsModule { }
