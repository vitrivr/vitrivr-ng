import {Component, ViewChild, Input} from "@angular/core";
import {SketchDialogComponent} from "../sketch/sketchdialog.component";
import {MdDialog} from '@angular/material';
import {ImageQueryTerm} from "../../types/query.types";

@Component({
    selector: 'qt-image',
    template:`
        <img #previewimg style="width:220px; height:220px; border:solid 1px;" (click)="edit()"/>
        <md-slider min="1" max="4" step="1" [(ngModel)]="sliderSetting" (change)="sliderChanged($event)"></md-slider>
    `
})

export class ImageQueryTermComponent {
    @ViewChild('previewimg') private previewimg: any;

    @Input() imageTerm: ImageQueryTerm;

    private sliderSetting : number;

    private context: CanvasRenderingContext2D;

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
        dialogRef.componentInstance.sketchpad.setImageBase64(this.previewimg.nativeElement.src);
        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.previewimg.nativeElement.src = result;
                this.imageTerm.image = result;
            }
        });
    }
}