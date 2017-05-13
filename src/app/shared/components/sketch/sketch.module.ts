import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SketchCanvas } from "./sketch-canvas.component";
import { FormsModule } from "@angular/forms";

@NgModule({
    imports:      [ BrowserModule, FormsModule ],
    declarations: [ SketchCanvas ],
    exports: [ SketchCanvas ]
})
export class SketchModule { }
