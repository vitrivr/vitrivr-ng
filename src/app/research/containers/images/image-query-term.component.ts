import {Component, ViewChild, Input} from "@angular/core";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {MdDialog} from '@angular/material';
import {ImageQueryTerm} from "../../../shared/model/queries/image-query-term.model";
import {BinarySketchDialogComponent} from "./binary-sketch-dialog.component";

@Component({
    selector: 'qt-image',
    templateUrl: 'image-query-term.component.html',
    styleUrls: ['image-query-term.component.css']
})

export class ImageQueryTermComponent {

    /** Component used to display a preview of the selected AND/OR sketched image. */
    @ViewChild('previewimg') private previewimg: any;

    /** The ImageQueryTerm object associated with this ImageQueryTermComponent. That object holds all the settings. */
    @Input() imageTerm: ImageQueryTerm;

    /** Slider to adjust the query-term settings; i.e. to select the refinement used for image-queries. */
    public sliderSetting : number = 2;

    /** Slider to onToggleButtonClicked between normal image / sketch mode and 3D-sketch mode. */
    public mode3D : boolean = false;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(private dialog: MdDialog) {}

    /**
     * Triggered whenever either the slider for the findSimilar settings is used.
     * Adjusts the settings in the ImageQueryTerm.
     *
     * @param event
     */
    public onSettingsChanged(event:any) {
        this.imageTerm.setting(this.sliderSetting);
    }

    /**
     * Triggered whenever the Mode 3D Slide toggle is used to switch between
     * 3D-sketch mode and normal mode.
     *
     * @param event
     */
    public onModeToggled(event: any) {
        if (this.mode3D) {
            this.sliderSetting = 100;
        } else {
            this.sliderSetting = 2;
        }
        this.imageTerm.setting(this.sliderSetting);
    }

    /**
     * Triggered whenever someone click on the image, which indicates that
     * it should be edited; opens the SketchDialogComponent
     */
    public onViewerClicked() {
        this.openSketchDialog(this.previewimg.nativeElement.src);
    }

    /**
     * Fired whenever something is dragged over the canvas.
     * @param event
     */
    public onViewerDragEnter(event: any) {
        event.preventDefault();

        /* If Mode3D is active; return (no drag & drop support). */
        if (this.mode3D) return;

        /* Add the ondrag class (change of border-style). */
        event.target.classList.add('ondrag');
    }

    /**
     *
     * @param event
     */
    public onViewerDragOver(event: any) {
        event.preventDefault();
    }

    /**
     *
     * @param event
     */
    public onViewerDragExit(event: any) {
        event.preventDefault();

        /* If Mode3D is active; return (no drag & drop support). */
        if (this.mode3D) return;

        /* Remove the ondrag class (change of border-style). */
        event.target.classList.remove("ondrag");
    }

    /**
     * Handles the case in which an object is dropped over the preview-image. If the object is a file, that
     * object is treated as image and handed to the SketchDialogComponent.
     *
     * @param event Drop event
     */
    public onViewerDropped(event: any) {
        /* Prevent propagation. */
        event.preventDefault();
        event.stopPropagation();

        /* If Mode3D is active; return (no drag & drop support). */
        if (this.mode3D) return;

        /* Remove the ondrag class (change of border-style). */
        event.target.classList.remove("ondrag");

        /* */
        if (event.dataTransfer.files.length > 0) {
            let file = URL.createObjectURL(event.dataTransfer.files.item(0));
            this.openSketchDialog(file);
        }
    }

    /**
     * Opens the SketchDialogComponent and registers a callback that loads the saved
     * result of the dialog into preview image canvas.
     *
     * @param data Optional data that should be handed to the component.
     */
    private openSketchDialog(data? : any) {
        /* Initialize the correct dialog-component. */
        let dialogRef = null;
        if (this.mode3D) {
            dialogRef = this.dialog.open(BinarySketchDialogComponent, {})
        } else {
            dialogRef = this.dialog.open(SketchDialogComponent, {data : data, height:'450px'})
        }

        /* Register the onClose callback. */
        dialogRef.afterClosed().first().subscribe(result => {
            if (result) {
                this.previewimg.nativeElement.src = result;
                this.imageTerm.data = result;
            }
        });
    }
}