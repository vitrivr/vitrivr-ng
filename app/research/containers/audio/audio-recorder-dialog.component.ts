import {Component, ViewChild} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {AudioRecorderComponent} from "../../../shared/components/audio/audio-recorder.component";

@Component({
    moduleId: module.id,
    selector: 'sketchpad',
    template: `<record-audio #recorder></record-audio>
            
            
        <button md-raised-button (click)="onRecordButtonPressed()"><md-icon [attr.class]="recorder.isRecording() ? 'material-icons  rec-active' : 'material-icons rec'">fiber_manual_record</md-icon></button>
        <button md-raised-button (click)="onPlayButtonPressed()"><md-icon [attr.class]="recorder.isPlaying() ? 'material-icons  play-active' : 'material-icons  play'">play_arrow</md-icon></button>
    `,
    styles: [
        '.play { color: #008000; }',
        '.play-active {  color: #008000; text-shadow: 0px 0px 6px #009800; }',
        '.rec {  color: #980000 }',
        '.rec-active {  color: #980000; text-shadow: 0px 0px 6px #B00000 ; }'
    ]
})

export class AudioRecorderDialogComponent {

    /** Sketch-canvas component. */
    @ViewChild('recorder')
    private recorder: AudioRecorderComponent;

    /**
     *
     * @param dialogRef
     */
    constructor(public dialogRef: MdDialogRef<AudioRecorderDialogComponent>) {

    }

    /**
     *
     */
    private onRecordButtonPressed() {
        if (this.recorder.isRecording()) {
            this.recorder.stop();
        } else {
            this.recorder.record()
        }
    }

    /**
     *
     */
    private onPlayButtonPressed() {
        if (this.recorder.isRecording()) {
            this.recorder.stop();
        }
        this.recorder.play();
    }
}