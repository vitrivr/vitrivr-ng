import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {PoseQueryTermComponent} from './pose-query-term.component';
import {PoseWebcamDialogComponent} from './pose-webcam-dialog.component';
import {WebcamModule} from '../../../shared/components/webcam/webcam.module';
import {PoseModule} from '../../../shared/components/pose/pose.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, WebcamModule, PoseModule],
  declarations: [PoseQueryTermComponent, PoseWebcamDialogComponent],
  exports: [PoseQueryTermComponent],
  entryComponents: [PoseWebcamDialogComponent]
})
export class PoseQueryTermModule {
}
