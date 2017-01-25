import {Component, ViewChild, Input} from "@angular/core";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {MdDialog} from '@angular/material';
import {ImageQueryTerm} from "../../../shared/model/queries/image-query-term.model";

@Component({
    selector: 'qt-image',
    template:`
        <img #previewimg style="width:220px; height:220px; border:solid 1px;" (click)="edit()"/>
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon>brush</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="4" step="1" value="2" [(ngModel)]="sliderSetting" (change)="sliderChanged($event)"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon>insert_photo</md-icon>
        </div>
    `
})

export class ImageQueryTermComponent {
    @ViewChild('previewimg') private previewimg: any;

    @Input() imageTerm: ImageQueryTerm;

    private sliderSetting : number = 2;

    constructor(public dialog: MdDialog) {}

    /**
     *
     * @param event
     */
    sliderChanged(event:any) {
        this.imageTerm.setting(this.sliderSetting);
    }

    edit() {
        let dialogRef = this.dialog.open(SketchDialogComponent);
        dialogRef.componentInstance.getSketchPad().setImageBase64(this.previewimg.nativeElement.src);
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.previewimg.nativeElement.src = result;
                this.imageTerm.image = result;
            }
        });
    }
}