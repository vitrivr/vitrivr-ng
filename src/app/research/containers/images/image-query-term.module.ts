import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {ImageQueryTermComponent} from "./image-query-term.component";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {SketchModule} from "../../../shared/components/sketch/sketch.module";
import {ColorPickerModule} from "angular2-color-picker";


@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule.forRoot(), SketchModule, ColorPickerModule],
    declarations: [ ImageQueryTermComponent, SketchDialogComponent ],
    exports:      [ ImageQueryTermComponent  ],
    entryComponents: [ SketchDialogComponent  ]
})

export class ImageQueryTermModule { }
