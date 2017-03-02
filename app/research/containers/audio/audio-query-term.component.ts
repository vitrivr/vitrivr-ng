import {Component, ViewChild, Input} from "@angular/core";

import {MdDialog} from '@angular/material';
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";
import {AudioQueryTerm} from "../../../shared/model/queries/audio-query-term.model";

@Component({
    selector: 'qt-audio',
    template:`
        <img #previewimg style="width:200px; height:200px; border:solid 1px;" (click)="edit()"/>
        <audio #player controls style="width:200px;"></audio>
        
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon class="muted">brush</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="4" step="1" value="2"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon class="muted">insert_photo</md-icon>
        </div>`
})

export class AudioQueryTermComponent {
    @ViewChild('player') private player: any;

    @Input() audioTerm: AudioQueryTerm;

    private sliderSetting : number = 2;

    constructor(public dialog: MdDialog) {}

    /**
     *
     */
    edit() {
        let dialogRef = this.dialog.open(AudioRecorderDialogComponent);
        dialogRef.afterClosed().subscribe(result => {
            result.then((data: Blob) => {
                this.player.nativeElement.src = URL.createObjectURL(data);
                let reader = new FileReader();
                reader.onloadend = () => {
                    this.audioTerm.data = reader.result;
                };
                reader.readAsDataURL(data);
            })
        });
    }
}