import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {WebcamCaptureComponent} from './webcam-capture.component';
import {MaterialModule} from '../../../material.module';
import {PoseModule} from '../pose/pose.module';
import {FlexLayoutModule} from '@angular/flex-layout';

@NgModule({
  imports: [BrowserModule, FormsModule, MaterialModule, FlexLayoutModule, PoseModule],
  declarations: [WebcamCaptureComponent],
  exports: [WebcamCaptureComponent]
})
export class WebcamModule {
}
