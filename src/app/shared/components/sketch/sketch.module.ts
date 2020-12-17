import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {SketchCanvasComponent} from './sketch-canvas.component';
import {TrackingSketchCanvasComponent} from './tracking-sketch-canvas.component';

@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [SketchCanvasComponent, TrackingSketchCanvasComponent],
  exports: [SketchCanvasComponent, TrackingSketchCanvasComponent]
})
export class SketchModule {
}
