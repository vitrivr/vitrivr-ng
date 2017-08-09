import * as THREE from 'three';
import {Component, ViewChild, Input} from "@angular/core";
import {MdDialog} from '@angular/material';
import {M3DQueryTerm} from "../../../shared/model/queries/m3d-query-term.model";
import {M3DLoaderDialogComponent} from "./m3d-loader-dialog.component";
import {M3DLoaderComponent} from "../../../shared/components/m3d/m3d-loader.component";

import Mesh = THREE.Mesh;
import {BinarySketchDialogComponent} from "./binary-sketch-dialog.component";
import {QueryTermInterface} from "../../../shared/model/queries/interfaces/query-term.interface";
import {Model3DFileLoader} from "../../../shared/util/m3d-file-loader.util";

@Component({
    selector: 'qt-m3d',
    templateUrl: 'm3d-query-term.component.html',
    styleUrls: ['m3d-query-term.component.css']
})
export class M3DQueryTermComponent {
    /** Component used to display a preview of the selected 3D model. */
    @ViewChild('previewmodel')
    private preview: M3DLoaderComponent;

    /** Component used to display a preview of the sketched image (binary). */
    @ViewChild('previewimg')
    private previewimg: any;

    /** The M3DQueryTerm object associated with this M3DQueryTermComponent. That object holds all the query-settings. */
    @Input()
    private m3dTerm: QueryTermInterface;

    /** Value of the slider. */
    public sliderSetting : number;

    /** Slider to onToggleButtonClicked between normal image / sketch mode and 3D-sketch mode. */
    public sketch : boolean = false;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(private dialog: MdDialog) {}

    /**
     * Triggered whenever the Mode 3D Slide toggle is used to switch between 3D-sketch mode and normal mode.
     */
    public onModeToggled() {
        if (this.sketch) {
            this.sliderSetting = 100;
        } else {
            this.sliderSetting = 1;
        }
        this.onSliderChanged();
    }

    /**
     * This method is invoked whenever the slider value changes. Updates the feature-categories for this M3DQueryTerm
     * based on a linear, numerical scale.
     */
    public onSliderChanged() {
        switch (this.sliderSetting) {
            case 0:
                this.m3dTerm.setCategories(['sphericalharmonicslow']);
                break;
            case 1:
                this.m3dTerm.setCategories(['sphericalharmonicsdefault']);
                break;
            case 2:
                this.m3dTerm.setCategories(['sphericalharmonicshigh', 'lightfield']);
                break;
            case 100:
                this.m3dTerm.setCategories(['lightfield']);
                break;
            default:
                break;
        }
    }

    /**
     * Triggered whenever the m3d-loader component is clicked by the user. Causes the
     * selection dialog to be opened.
     */
    public onModelViewerClicked() {
        this.openM3DDialog(this.preview.getMesh());
    }

    /**
     * Fired whenever something is dragged and enters the preview image.
     *
     * @param event
     */
    public onModelViewerDragEnter(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Fired whenever something is dragged over the preview image.
     *
     * @param event
     */
    public onModelViewerDragOver(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Fired whenever something is dragged and exits the preview image.
     *
     * @param event
     */
    public onModelViewerDragExit(event: any) {
        event.preventDefault();
        event.stopPropagation();
    }

    /**
     * Handles the case in which an object is dropped over the preview-image. If the object is a file, that
     * object is treated as image and handed to the SketchDialogComponent.
     *
     * @param event Drop event
     */
    public onModelViewerDropped(event: any) {
        /* Prevent propagation. */
        event.preventDefault();
        event.stopPropagation();

        /* If the DataTransfer object of the event contains a file: apply the first one. */
        if (event.dataTransfer.files.length > 0) {
            Model3DFileLoader.loadFromFile(event.dataTransfer.files.item(0), (mesh : Mesh) => {
                this.preview.setMesh(mesh);
                this.m3dTerm.data = "data:application/3d-json;base64," + btoa(JSON.stringify(mesh.geometry.toJSON().data));
            });
        }
    }

    /**
     * Triggered whenever the preview image is clicked by the user. Causes the
     * sketch dialog to be opened.
     */
    public onImageViewerClicked() {
        this.openSketchDialog(this.previewimg.nativeElement.src);
    }

    /**
     * Opens the M3DLoaderDialogComponent and registers a callback that loads the saved
     * result of the dialog into preview image canvas.
     *
     * @param data Optional data that should be handed to the component.
     */
    private openM3DDialog(data? : any) {
        let dialogRef = this.dialog.open(M3DLoaderDialogComponent, {data : data});
        dialogRef.afterClosed().first().subscribe((result : Mesh) => {
            if (result) {
                this.preview.setMesh(result);
                this.preview.render();
                this.m3dTerm.data =  "data:application/3d-json;base64," + btoa(JSON.stringify(result.geometry.toJSON().data));
            }
        });
    }

    /**
     * Opens the M3DLoaderDialogComponent and registers a callback that loads the saved
     * result of the dialog into preview image canvas.
     */
    private openSketchDialog(data? : any) {
        let dialogRef = this.dialog.open(BinarySketchDialogComponent, {data : data});
        dialogRef.afterClosed().first().subscribe(result => {
            if (result) {
                this.previewimg.nativeElement.src = result;
                this.m3dTerm.data = result;
            }
        });
    }
}