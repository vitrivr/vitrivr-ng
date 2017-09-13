import {NgModule} from '@angular/core';
import {ObjectdetailsComponent} from "./objectdetails.component";
import {BrowserModule} from "@angular/platform-browser";
import {AppRoutingModule} from "../app-routing.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {M3DLoaderModule} from "../shared/components/m3d/m3d-loader-module";

import {MaterialModule} from "../material.module";
import {ImagecropComponent} from "./imagecrop.component";
import {ImageCropperModule} from "ng2-img-cropper";
import {QuickViewerComponent} from "./quick-viewer.component";

@NgModule({
    imports:      [ MaterialModule, FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule, ImageCropperModule ],
    declarations: [ ObjectdetailsComponent, ImagecropComponent, QuickViewerComponent ],
    exports: [ ObjectdetailsComponent, QuickViewerComponent ],
    entryComponents: [ ImagecropComponent, QuickViewerComponent ]
})

export class ObjectdetailsModule { }
