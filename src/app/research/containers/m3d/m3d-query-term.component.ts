import {Component, ViewChild, Input} from "@angular/core";
import {MdDialog} from '@angular/material';
import {M3DQueryTerm} from "../../../shared/model/queries/m3d-query-term.model";
import {M3DLoaderDialogComponent} from "./m3d-loader-dialog.component";
import Mesh = THREE.Mesh;
import {M3DLoaderComponent} from "../../../shared/components/m3d/m3d-loader.component";

@Component({
    selector: 'qt-m3d',
    template:`
        <m3d-loader #preview  [width]="200" [height]="200" [interaction]="false" (click)="edit()"></m3d-loader>
    `
})

export class M3DQueryTermComponent {
    @ViewChild('preview')
    private preview: M3DLoaderComponent;

    @Input() m3dTerm: M3DQueryTerm;



    /**
     *
     * @type {number}
     */
    private sliderSetting : number = 2;

    /**
     *
     * @param dialog
     * @param _renderer
     */
    constructor(public dialog: MdDialog) {

    }

    /**
     *
     */
    private edit() {
        let dialogRef = this.dialog.open(M3DLoaderDialogComponent);
        dialogRef.afterClosed().subscribe((result : Mesh) => {
            if (result) {
                this.preview.setMesh(result);
                this.preview.render();
                this.m3dTerm.data =  "data:application/3d-json;base64," + btoa(JSON.stringify(result.geometry.toJSON().data));
            }
        });
    }
}