import {Component, ViewChild, HostListener} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {AudioRecorderComponent} from "../../../shared/components/audio/audio-recorder.component";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {TimeFormatterUtil} from "../../../shared/util/TimeFormatterUtil";
import {WaveAudioUtil} from "../../../shared/util/WaveAudioUtil";


@Component({
    moduleId: module.id,
    selector: 'audio-recorder',
    templateUrl: 'audio-recorder-dialog.component.html',
    styles: [
        '.play-active {  color: #008000; text-shadow: 0 0 6px #009800; }',
        '.rec-active {  color: #980000; text-shadow: 0 0 6px #B00000 ; }'
    ]
})
export class AudioRecorderDialogComponent {
    /** Audio-recorder component. */
    @ViewChild('recorder')
    private recorder: AudioRecorderComponent;

    /** Hidden input for image upload. */
    @ViewChild('audioloader')
    private audioloader: any;

    /** Current recorder status. */
    private status: RecorderStatus = "Idle";

    /** Timestamp of the start of either playback or recording. */
    private start: number;

    /** A time used to keep track of state changes in the audio-recorder. */
    private timer: Subscription;

    /** Text representing the current status of the audio-recorder. */
    private _statustext : String;

    /**
     *
     * @param dialogRef
     */
    constructor(private dialogRef: MdDialogRef<AudioRecorderDialogComponent>) {
        this.timer = Observable.timer(0, 500).timestamp().subscribe((x) => {
            if (this.recorder.isPlaying() && this.status != "Playing") {
                this.start = x.timestamp;
                this.status = "Playing";
            } else if (this.recorder.isRecording() && this.status != "Recording") {
                this.start = x.timestamp;
                this.status = "Recording";
            } else if (!this.recorder.isPlaying() && !this.recorder.isRecording() && this.status != "Idle") {
                this.start = 0;
                this.status = "Idle";
            } else if (this.status == "Recording") {
                this._statustext = "Recording: " + TimeFormatterUtil.toTimer(x.timestamp - this.start);
            } else if (this.status == "Playing") {
                this._statustext = "Playing: " + TimeFormatterUtil.toTimer(x.timestamp - this.start) + " / " + TimeFormatterUtil.toTimer(this.recorder.duration() * 1000);
            } else if (this.status == "Idle") {
                if (this.recorder.length() > 0) {
                    this._statustext = "Idle (Audio available)";
                } else {
                    this._statustext = "Idle (No audio)";
                }
            }
        });
    }

    /**
     * Change listener for the input field (File chooser). Handles the
     * upload of audio files.
     *
     * @param event
     */
    @HostListener('change', ['$event'])
    onChange(event: any) {
        if (this.recorder.isPlaying() || this.recorder.isRecording()) this.recorder.stop();
        let reader = new FileReader();
        reader.addEventListener("load", () => {
            this.recorder.loadAudio(reader.result);
        });
        reader.readAsArrayBuffer(event.target.files[0]);
    };

    /**
     * Triggered whenever the record-button is pressed. Either starts recording or
     * stops it (if recorder is already recording).
     */
    public onRecordButtonPressed() {
        if (this.recorder.isRecording()) {
            this.recorder.stop();
        } else if (this.recorder.isPlaying()) {
            this.recorder.stop();
            this.recorder.record()
        } else {
            this.recorder.record();
        }
    }

    /**
     * Triggered whenever the play-button is pressed. Either starts playback or
     * stops it (if recorder is already playing something).
     */
    public onPlayButtonPressed() {
        if (this.recorder.isPlaying()) {
            this.recorder.stop();
        } else if (this.recorder.isRecording()) {
            this.recorder.stop();
            this.recorder.play();
        } else {
            this.recorder.play();
        }
    }

    /**
     * Triggered, whenever the upload button is pressed. Show the select
     * file dialog.
     */
    public onLoadAudioPressed() {
        this.audioloader.nativeElement.click();
    }

    /**
     * Triggered, whenever the save button is pressed. Converts the data recorded
     * in the audio recorder into 22050Hz Mono WAV and returns it to the caller.
     */
    public onSaveButtonPressed() {
        if (this.recorder.data()) {
            this.dialogRef.close(WaveAudioUtil.toWav(this.recorder.data(), 1, 22050));
        } else {
            this.dialogRef.close();
        }
    }

    /**
     * Getter for statustext.
     *
     * @returns {String}
     */
    get statustext(): String {
        return this._statustext;
    }
}

type RecorderStatus = "Idle" | "Playing" | "Recording";