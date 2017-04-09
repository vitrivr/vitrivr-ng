import {Component, ViewChild, Input} from "@angular/core";
import {MdDialog} from '@angular/material';
import {M3DQueryTerm} from "../../../shared/model/queries/m3d-query-term.model";
import {M3DLoaderDialogComponent} from "./m3d-loader-dialog.component";
import Mesh = THREE.Mesh;
import {M3DLoaderComponent} from "../../../shared/components/m3d/m3d-loader.component";

@Component({
    selector: 'qt-m3d',
    template:`
        <m3d-loader #preview  [width]="150" [height]="150" [interaction]="false" (click)="onViewerClicked()"></m3d-loader>
        <hr class="fade" [style.margin-top]="'10px'" [style.margin-bottom]="'20px'"/>
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
    public sliderSetting : number = 2;

    /**
     * Default constructor.
     *
     * @param dialog
     * @param _renderer
     */
    constructor(private dialog: MdDialog) {}

    /**
     * Triggered whenever the m3d-loader component is clicked by the user. Causes the
     * selection dialog to be opened.
     */
    public onViewerClicked() {
        let dialogRef = this.dialog.open(M3DLoaderDialogComponent);
        let subscription = dialogRef.afterClosed().subscribe((result : Mesh) => {
            if (result) {
                this.preview.setMesh(result);
                this.preview.render();
                this.m3dTerm.data =  "data:application/3d-json;base64," + btoa(JSON.stringify(result.geometry.toJSON().data));
            }
            subscription.unsubscribe();
        });
    }
}