import {Component, ViewChild, Input} from "@angular/core";
import {SketchDialogComponent} from "./sketch-dialog.component";
import {MdDialog} from '@angular/material';
import {ImageQueryTerm} from "../../../shared/model/queries/image-query-term.model";
@Component({
    selector: 'qt-image',
    templateUrl: 'image-query-term.component.html',
    styleUrls: ['image-query-term.component.css']
})
export class ImageQueryTermComponent {

    /** Component used to display a preview of the selected AND/OR sketched image. */
    @ViewChild('previewimg')
    private previewimg: any;

    /** The ImageQueryTerm object associated with this ImageQueryTermComponent. That object holds all the settings. */
    @Input()
    private imageTerm: ImageQueryTerm;

    /** Slider to adjust the query-term settings; i.e. to select the refinement used for image-queries. */
    public sliderSetting : number = 2;

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
     * Triggered whenever someone click on the image, which indicates that
     * it should be edited; opens the SketchDialogComponent
     */
    public onViewerClicked() {
        this.openSketchDialog(this.previewimg.nativeElement.src);
    }

    /**
     * Fired whenever something is dragged and enters the preview image.
     *
     * @param event
     */
    public onViewerDragEnter(event: any) {
        event.preventDefault();
        event.target.classList.add('ondrag');
    }

    /**
     * Fired whenever something is dragged over the preview image.
     *
     * @param event
     */
    public onViewerDragOver(event: any) {
        event.preventDefault();
    }

    /**
     * Fired whenever something is dragged and exits the preview image.
     *
     * @param event
     */
    public onViewerDragExit(event: any) {
        event.preventDefault();
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

        /* Remove the ondrag class (change of border-style). */
        event.target.classList.remove("ondrag");

        /* If the DataTransfer object of the event contains a file: apply the first one. */
        if (event.dataTransfer.files.length > 0) {
            let reader = new FileReader();
            reader.addEventListener("load", () => {
                this.applyImageData(reader.result);
            });
            reader.readAsDataURL(event.dataTransfer.files.item(0));
        }
    }

    /**
     * Applies image data and updates the ImageQueryTerm's data attribute as well as
     * the preview image.
     *
     * @param data Data that should be added (must be base64 encoded).
     */
    private applyImageData(data : string) {
        this.previewimg.nativeElement.src = data;
        this.imageTerm.data = data;
    }

    /**
     * Opens the SketchDialogComponent and registers a callback that loads the saved
     * result of the dialog into preview image canvas.
     *
     * @param data Optional data that should be handed to the component.
     */
    private openSketchDialog(data? : any) {
        /* Initialize the correct dialog-component. */
        let dialogRef = this.dialog.open(SketchDialogComponent, {data : data, height:'450px'});

        /* Register the onClose callback. */
        dialogRef.afterClosed().first().subscribe(result => {
            if (result) this.applyImageData(result);
        });
    }
}