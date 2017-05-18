import {Component, ViewChild, HostListener, OnInit, Inject} from '@angular/core';
import {MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {SketchCanvas} from "../../../shared/components/sketch/sketch-canvas.component";

@Component({
    moduleId: module.id,
    selector: 'sketchpad',
    templateUrl: 'sketch-dialog.component.html'
})

export class SketchDialogComponent implements OnInit {
    /** Hidden input for image upload. */
    @ViewChild('imageloader')
    private imageloader: any;

    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private _sketchpad: SketchCanvas;

    /** Default color (black). */
    public color : string = "#000000";

    /**
     *
     * @param _dialogRef
     * @param _data
     */
    constructor(private _dialogRef: MdDialogRef<SketchDialogComponent>, @Inject(MD_DIALOG_DATA) private _data : string) {}

    /**
     * Invoked after initialization. Applies the injected image data (if specified).
     */
    public ngOnInit(): void {
        if(this._data) this._sketchpad.setImageBase64(this._data);
        this._data = null;
    }

    /**
     * Change listener for the input field (File chooser). Handles the
     * image upload.
     *
     * @param event
     */
    @HostListener('change', ['$event'])
    public onChange(event: any) {
        let URL = window.URL;
        this._sketchpad.setImageBase64(URL.createObjectURL(event.target.files[0]))
    };

    /**
     * Triggered when a color value is selected.
     *
     * @param color
     */
    public onColorChange(color: any) {
        this.color = color;
        this._sketchpad.setActiveColor(this.color);
    }

    /**
     * Triggered when the slider-value for the line-size changes.
     *
     * @param size
     */
    public onLineSizeChange(size : any) {
        this._sketchpad.setLineSize(size.value);
    }

    /**
     * Triggered when the 'Clear canvas' menu-item is pressed.
     *
     * Clears the canvas
     */
    public onClearCanvasClicked() {
        this._sketchpad.clearCanvas();
    }

    /**
     * Triggered when the 'Fill canvas' menu-item is pressed.
     *
     * Fills the canvas with the default color.
     */
    public onFillCanvasClicked() {
        this._sketchpad.fillCanvas();
    }

    /**
     * Triggered when the 'load-image' menu-item is pressed.
     *
     * Opens a file-chooser.
     */
    public onLoadImage() {
        this.imageloader.nativeElement.click();
    }

    /**
     * Closes the dialog.
     */
    public close() {
        this._dialogRef.close(this._sketchpad.getImageBase64());
    }
}