import {Component, ViewChild, HostListener} from "@angular/core";
import {M3DLoaderComponent} from "../../../shared/components/m3d/m3d-loader.component";
import {MatDialogRef} from "@angular/material";


@Component({
    moduleId: module.id,
    selector: 'm3dloader-dialog',
    templateUrl: 'm3d-loader-dialog.component.html'
})

export class M3DLoaderDialogComponent {
    /** Sketch-canvas component. */
    @ViewChild('m3dloader')
    private loader: M3DLoaderComponent;

    /** Hidden input for image upload. */
    @ViewChild('fileloader')
    private fileloader: any;

    /**
     *
     * @param dialogRef
     */
    constructor(private dialogRef: MatDialogRef<M3DLoaderDialogComponent>) {}

    /**
     * Change listener for the input field (File chooser). Handles the
     * image upload.
     *
     * @param event
     */
    public onFileAvailable(event: any) {
        this.loader.loadMeshFromFile(event.target.files[0])
        this.fileloader.nativeElement.value = null;
    };

    /**
     * Triggered when the 'load file' toolbar button is pressed.
     * Opens a file picker.
     */
    public onLoadFilePressed() {
        this.fileloader.nativeElement.click();
    }

    /**
     * Triggered when the 'save' toolbar button is pressed.
     * Opens a file picker.
     */
    public onSavePressed() {
        if (this.loader.getMesh()) {
            this.dialogRef.close(this.loader.getMesh());
        } else {
            this.dialogRef.close();
        }
    }
}