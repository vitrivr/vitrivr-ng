import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {AudioRecorderComponent} from './audio-recorder.component';


@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [AudioRecorderComponent],
  exports: [AudioRecorderComponent]
})

export class AudioRecorderModule {
}
