import {Component, ViewChild, Inject, OnInit, OnDestroy, Optional} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from '@angular/material';
import {AudioRecorderComponent} from "../../../shared/components/audio/audio-recorder.component";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {TimeFormatterUtil} from "../../../shared/util/timer-formatter.util";
import {WaveAudioUtil} from "../../../shared/util/wave-audio.util";


@Component({
    moduleId: module.id,
    selector: 'audio-recorder',
    templateUrl: 'audio-recorder-dialog.component.html',
    styles: [
        '.play-active {  color: #008000; text-shadow: 0 0 6px #009800; }',
        '.rec-active {  color: #980000; text-shadow: 0 0 6px #B00000 ; }'
    ]
})
export class AudioRecorderDialogComponent implements OnInit, OnDestroy {
    /** Audio-recorder component. */
    @ViewChild('recorder')
    private _recorder: AudioRecorderComponent;

    /** Hidden input for image upload. */
    @ViewChild('audioloader')
    private audioloader: any;

    /** Current recorder status. */
    private status: RecorderStatus = "Idle";

    /** Timestamp of the start of either playback or recording. */
    private start: number;

    /** A time used to keep track of state changes in the audio-recorder. */
    private _timer: Subscription;

    /** Text representing the current status of the audio-recorder. */
    private _statustext : String;

    /**
     *
     * @param dialogRef
     * @param _data Data that is passed to the AudioRecorderDialogComponent.
     */
    constructor(private dialogRef: MdDialogRef<AudioRecorderDialogComponent>, @Optional() @Inject(MD_DIALOG_DATA) private _data? : any) {}

    /**
     * Lifecycle Hook (onInit): Loads the injected audio data (if specified) and creates
     * the timer observable.
     */
    public ngOnInit(): void {
        if (this._data && this._data instanceof File) {
            this._recorder.loadAudioFromFile(this._data);
        }
        this._data = null;
        this._timer = Observable.timer(0, 500).timestamp().subscribe((x) => {
            if (this._recorder.isPlaying() && this.status != "Playing") {
                this.start = x.timestamp;
                this.status = "Playing";
            } else if (this._recorder.isRecording() && this.status != "Recording") {
                this.start = x.timestamp;
                this.status = "Recording";
            } else if (!this._recorder.isPlaying() && !this._recorder.isRecording() && this.status != "Idle") {
                this.start = 0;
                this.status = "Idle";
            } else if (this.status == "Recording") {
                this._statustext = "Recording: " + TimeFormatterUtil.toTimer(x.timestamp - this.start);
            } else if (this.status == "Playing") {
                this._statustext = "Playing: " + TimeFormatterUtil.toTimer(x.timestamp - this.start) + " / " + TimeFormatterUtil.toTimer(this._recorder.duration() * 1000);
            } else if (this.status == "Idle") {
                if (this._recorder.length() > 0) {
                    this._statustext = "Idle (Audio available)";
                } else {
                    this._statustext = "Idle (No audio)";
                }
            }
        });
    }

    /**
     * Lifecycle Hook (onDestroy): Unsubscribes from the timer observable.
     */
    public ngOnDestroy(): void {
        this._timer.unsubscribe();
    }

    /**
     * Change listener for the input field (File chooser). Handles the
     * upload of audio files.
     *
     * @param event
     */
    public onFileAvailable(event: any) {
        this._recorder.loadAudioFromFile(event.target.files[0]);
        this.audioloader.nativeElement.value = null;
    };

    /**
     * Getter for AudioRecorderComponent.
     *
     * @return {AudioRecorderComponent}
     */
    get recorder(): AudioRecorderComponent {
        return this._recorder;
    }

    /**
     * Triggered whenever the record-button is pressed. Either starts recording or
     * stops it (if recorder is already recording).
     */
    public onRecordButtonPressed() {
        if (this._recorder.isRecording()) {
            this._recorder.stop();
        } else if (this._recorder.isPlaying()) {
            this._recorder.stop();
            this._recorder.record()
        } else {
            this._recorder.record();
        }
    }

    /**
     * Triggered whenever the play-button is pressed. Either starts playback or
     * stops it (if recorder is already playing something).
     */
    public onPlayButtonPressed() {
        if (this._recorder.isPlaying()) {
            this._recorder.stop();
        } else if (this._recorder.isRecording()) {
            this._recorder.stop();
            this._recorder.play();
        } else {
            this._recorder.play();
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
        if (this._recorder.data()) {
            this.dialogRef.close(WaveAudioUtil.toWav(this._recorder.data(), 1, 22050));
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