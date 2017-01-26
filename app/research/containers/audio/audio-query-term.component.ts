import {Component, ViewChild, Input} from "@angular/core";

import {MdDialog} from '@angular/material';
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";

@Component({
    selector: 'qt-audio',
    template:`
        <audio controls (click)="edit()" style="width:90%;">
            <source src="{{previewimg}}" type="audio/ogg">
            Your browser does not support the audio element.
        </audio>
        
        <button (click)="edit()" class="icon-button">
            <md-icon>panorama</md-icon>
        </button>
        
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon class="muted">brush</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="4" step="1" value="2"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon class="muted">insert_photo</md-icon>
        </div>`


})

export class AudioQueryTermComponent {
    @ViewChild('previewimg') private previewimg: any;

    private sliderSetting : number = 2;

    constructor(public dialog: MdDialog) {}

    edit() {
        let dialogRef = this.dialog.open(AudioRecorderDialogComponent);
        dialogRef.afterClosed().subscribe(result => {

        });
    }
}