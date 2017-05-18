import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {GalleryComponent} from "./gallery.component";
import {AppRoutingModule} from "../app-routing.module";
import {MaterialModule} from "../material.module";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, AppRoutingModule, FlexLayoutModule ],
    declarations: [ GalleryComponent ],
    exports: [ GalleryComponent ]
})

export class GalleryModule { }
