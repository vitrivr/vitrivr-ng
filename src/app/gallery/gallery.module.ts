import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {GalleryComponent} from "./gallery.component";
import {AppRoutingModule} from "../app-routing.module";
import {MaterialModule} from "../material.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, AppRoutingModule ],
    declarations: [ GalleryComponent ],
    exports: [ GalleryComponent ]
})

export class GalleryModule { }
