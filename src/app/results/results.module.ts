import {NgModule}      from '@angular/core';
import {ListModule} from "./list/list.module";
import {GalleryModule} from "./gallery/gallery.module";
@NgModule({
    imports:      [ GalleryModule, ListModule ],
    declarations: [ ],
    exports: [ GalleryModule, ListModule ]
})
export class ResultsModule { }
