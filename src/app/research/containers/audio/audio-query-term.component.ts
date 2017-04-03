import {Component, ViewChild, Input} from "@angular/core";

import {MdDialog} from '@angular/material';
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";
import {AudioQueryTerm} from "../../../shared/model/queries/audio-query-term.model";

@Component({
    selector: 'qt-audio',
    template:`
        <img #previewimg style="width:200px; height:200px; border:solid 1px;" (click)="onViewerClicked()"/>
        <audio #player controls style="width:200px;"></audio>
        
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon class="muted">fingerprint</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="3" step="1" value="1" [(ngModel)]="sliderSetting" (change)="onSliderChanged($event)"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon class="muted">record_voice_over</md-icon>
        </div>`
})

export class AudioQueryTermComponent {

    @ViewChild('player') private player: any;

    @Input() audioTerm: AudioQueryTerm;

    /** Default value of the slider. */
    public sliderSetting : number;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(public dialog: MdDialog) {}

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
        dialogRef.afterClosed().subscribe(result => {
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
        });
    }
}