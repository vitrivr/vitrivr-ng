import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SketchCanvas } from "./sketch-canvas.component";
import { FormsModule } from "@angular/forms";
import { MaterialModule, MdButtonModule } from "@angular/material";

@NgModule({
    imports:      [ BrowserModule, FormsModule,  MaterialModule.forRoot(), MdButtonModule ],
    declarations: [ SketchCanvas ],
    exports: [ SketchCanvas ]
})
export class SketchModule { }
