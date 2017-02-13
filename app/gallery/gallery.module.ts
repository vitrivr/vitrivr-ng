import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {GalleryComponent} from "./gallery.component";
import {AppRoutingModule} from "../app-routing.module";

@NgModule({
    imports:      [ BrowserModule, FormsModule,  MaterialModule.forRoot(), AppRoutingModule ],
    declarations: [ GalleryComponent ],
    exports: [ GalleryComponent ]
})

export class GalleryModule { }
