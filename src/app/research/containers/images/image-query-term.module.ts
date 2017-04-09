import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {ImageQueryTermComponent} from "./image-query-term.component";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {SketchModule} from "../../../shared/components/sketch/sketch.module";
import {ColorPickerModule} from "angular2-color-picker";
import {BinarySketchDialogComponent} from "./binary-sketch-dialog.component";

@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule, SketchModule, ColorPickerModule],
    declarations: [ ImageQueryTermComponent, SketchDialogComponent, BinarySketchDialogComponent ],
    exports:      [ ImageQueryTermComponent  ],
    entryComponents: [ SketchDialogComponent, BinarySketchDialogComponent ]
})

export class ImageQueryTermModule { }
