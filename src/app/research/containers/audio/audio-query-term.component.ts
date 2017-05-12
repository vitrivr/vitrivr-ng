import {Component, ViewChild, Input} from "@angular/core";

import {MdDialog} from '@angular/material';
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";
import {AudioQueryTerm} from "../../../shared/model/queries/audio-query-term.model";

@Component({
    selector: 'qt-audio',
    template:`

        <div style="display:flex; align-items: center; justify-content: center;">
            <audio #player controls style="width:150px"></audio> <button md-icon-button (click)="onViewerClicked()"><md-icon>more_horiz</md-icon></button>
        </div>
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon class="muted" mdTooltip="Audio fingerprinting">fingerprint</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="4" step="1" value="1" [(ngModel)]="sliderSetting" (change)="onSliderChanged($event)"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon class="muted" mdTooltip="Query-by-Humming">record_voice_over</md-icon>
        </div>
        <hr class="fade" [style.margin-top]="'10px'" [style.margin-bottom]="'20px'"/>
        `


})

export class AudioQueryTermComponent {
    /** Component used to display a preview of the recorded/selected audio. */
    @ViewChild('player') private player: any;

    /** The AudioQueryTerm object associated with this AudioQueryTermComponent. That object holds all the query-settings. */
    @Input() audioTerm: AudioQueryTerm;

    /** Value of the slider. */
    public sliderSetting : number;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(private dialog: MdDialog) {}

    /**
     * This method is invoked whenever the slider value changes.
     *
     * @param event
     */
    public onSliderChanged(event:any) {
        this.audioTerm.setting(this.sliderSetting);
    }

    /**
     * This method is invoked, whenever someone clicks on the preview-image
     * of the AudioQueryTermComponent.
     *
     * Shows the audio-recorder dialog.
     */
    public onViewerClicked() {
        let dialogRef = this.dialog.open(AudioRecorderDialogComponent);
        let subscription = dialogRef.afterClosed().first().subscribe(result => {
            if (result) {
                result.then((data: Blob) => {
                    this.player.nativeElement.src = URL.createObjectURL(data);
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        this.audioTerm.data = reader.result;
                    };
                    reader.readAsDataURL(data);
                })
            }
            subscription.unsubscribe();
        });
    }
}