import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {ImageQueryTermComponent} from './image-query-term.component';
import {SketchDialogComponent} from './sketch-dialog.component';
import {SketchModule} from '../../../shared/components/sketch/sketch.module';
import {MaterialModule} from '../../../material.module';
import {ColorPickerModule} from 'ngx-color-picker';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, SketchModule, ColorPickerModule],
  declarations: [ImageQueryTermComponent, SketchDialogComponent],
  exports: [ImageQueryTermComponent],
  entryComponents: [SketchDialogComponent]
})

export class ImageQueryTermModule {
}
