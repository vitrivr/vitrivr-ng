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
import {ContainerPipesModule} from "../shared/pipes/containers/container-pipes.module";

import {VgCoreModule} from 'videogular2/core';
import {VgControlsModule} from 'videogular2/controls';
import {VgOverlayPlayModule} from 'videogular2/overlay-play';

@NgModule({
    imports:      [ MaterialModule, FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule, ImageCropperModule, ContainerPipesModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, ],
    declarations: [ ObjectdetailsComponent, ImagecropComponent, QuickViewerComponent ],
    exports: [ ObjectdetailsComponent, QuickViewerComponent ],
    entryComponents: [ ImagecropComponent, QuickViewerComponent ]
})

export class ObjectdetailsModule { }
