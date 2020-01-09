import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {AudioQueryTermComponent} from "./audio-query-term.component";
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";
import {AudioRecorderModule} from "../../../shared/components/audio/audio-recorder-module";
import {MaterialModule} from "../../../material.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, AudioRecorderModule],
    declarations: [ AudioQueryTermComponent, AudioRecorderDialogComponent ],
    exports:      [ AudioQueryTermComponent  ],
    entryComponents: [ AudioRecorderDialogComponent  ]
})

export class AudioQueryTermModule { }
