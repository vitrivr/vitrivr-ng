import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { SketchCanvas } from "./sketch-canvas.component";
import { TrackingSketchCanvasComponent } from "./tracking-sketch-canvas.component";

@NgModule({
    imports:      [ BrowserModule, FormsModule ],
    declarations: [ SketchCanvas, TrackingSketchCanvasComponent ],
    exports: [ SketchCanvas, TrackingSketchCanvasComponent ]
})
export class SketchModule { }
