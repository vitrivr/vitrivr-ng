import {Component, ViewChild, Input} from "@angular/core";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {MdDialog} from '@angular/material';
import {ImageQueryTerm} from "../../../shared/model/queries/image-query-term.model";

@Component({
    selector: 'qt-image',
    template:`
        <img #previewimg style="width:200px; height:200px; border:solid 1px;" (click)="onViewerClicked()"/>
        <div style="display:flex; align-items: center; justify-content: center;">
            <md-icon class="muted">brush</md-icon>
            <div class="toolbar-spacer-small"></div>
            <md-slider min="0" max="4" step="1" value="2" [(ngModel)]="sliderSetting" (change)="onSettingsChanged($event)"></md-slider>
            <div class="toolbar-spacer-small"></div>
            <md-icon class="muted">insert_photo</md-icon>
            <md-slide-toggle [(ngModel)]="toggle3DSetting" (change)="onSettingsChanged($event)">3D</md-slide-toggle>
        </div>
    `
})

export class ImageQueryTermComponent {

    /** Component used to display a preview of the selected AND/OR sketched image. */
    @ViewChild('previewimg') private previewimg: any;

    /** The ImageQueryTerm object associated with this ImageQueryTermComponent. That object holds all the settings. */
    @Input() imageTerm: ImageQueryTerm;

    /** Slider to adjust the query-term settings; i.e. to select the features used for image-queries. */
    public sliderSetting : number = 2;

    /** Slider to onToggleButtonClicked between normal image / sketch mode and 3D-sketch mode. */
    public toggle3DSetting : boolean = false;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(public dialog: MdDialog) {}

    /**
     * Triggered whenever either the slider is dragged or the toggle3DSetting switch
     * is toggled. Adjust the settings in the ImageQueryTerm.
     *
     * @param event
     */
    public onSettingsChanged(event:any) {
        if (this.toggle3DSetting) {
            this.imageTerm.setting(100);
        } else {
            this.imageTerm.setting(this.sliderSetting);
        }
    }

    /**
     * Triggered whenever someone click on the image, which indicates that it should
     * be edited.
     */
    public onViewerClicked() {
        let dialogRef = this.dialog.open(SketchDialogComponent);
        dialogRef.componentInstance.getSketchPad().setImageBase64(this.previewimg.nativeElement.src);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.previewimg.nativeElement.src = result;
                this.imageTerm.data = result;
            }
        });
    }
}