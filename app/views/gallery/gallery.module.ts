import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {GalleryComponent} from "./gallery.component";

@NgModule({
    imports:      [ BrowserModule, FormsModule,  MaterialModule.forRoot() ],
    declarations: [ GalleryComponent ],
    exports: [ GalleryComponent ]
})

export class GalleryModule { }
