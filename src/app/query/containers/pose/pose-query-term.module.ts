import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {PoseQueryTermComponent} from './pose-query-term.component';
import {PoseWebcamDialogComponent} from './pose-webcam-dialog.component';
import {WebcamModule} from '../../../shared/components/webcam/webcam.module';
import {PoseModule} from '../../../shared/components/pose/pose.module';
import {PoseDiscardConfirmComponent} from './pose-discard-confirm.component';
import {MatStepperModule} from '@angular/material/stepper';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, WebcamModule, PoseModule, MatStepperModule],
  declarations: [PoseQueryTermComponent, PoseWebcamDialogComponent, PoseDiscardConfirmComponent],
  exports: [PoseQueryTermComponent],
  entryComponents: [PoseWebcamDialogComponent, PoseDiscardConfirmComponent]
})
export class PoseQueryTermModule {
}
