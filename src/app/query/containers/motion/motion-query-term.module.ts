import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {MotionQueryTermComponent} from './motion-query-term.component';
import {MotionSketchDialogComponent} from './motion-sketch-dialog.component';
import {SketchModule} from '../../../shared/components/sketch/sketch.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, SketchModule],
  declarations: [MotionQueryTermComponent, MotionSketchDialogComponent],
  exports: [MotionQueryTermComponent],
  entryComponents: [MotionSketchDialogComponent]
})
export class MotionQueryTermModule {
}
