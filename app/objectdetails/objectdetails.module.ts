import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {ObjectdetailsComponent} from "./objectdetails.component";
import {BrowserModule} from "@angular/platform-browser";
import {AppRoutingModule} from "../app-routing.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {M3DLoaderModule} from "../shared/components/m3d/m3d-loader-module";

@NgModule({
    imports:      [ MaterialModule.forRoot(), FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule ],
    declarations: [ ObjectdetailsComponent ],
    exports: [ ObjectdetailsComponent ]
})

export class ObjectdetailsModule { }
