import {Component, ViewChild, OnInit, Inject, AfterViewInit} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {SketchCanvas} from "../../../shared/components/sketch/sketch-canvas.component";

@Component({
    moduleId: module.id,
    selector: 'sketchpad',
    templateUrl: 'sketch-dialog.component.html',
    styleUrls: ['sketch-dialog.component.css']
})

export class SketchDialogComponent implements OnInit, AfterViewInit {
    /** Default linesize when opening the dialog. */
    public static readonly DEFAULT_LINESIZE = 10.0;

    /** Hidden input for image upload. */
    @ViewChild('imageloader')
    private imageloader: any;

    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private _sketchpad: SketchCanvas;

    /** Current color (default: black). */
    public color : string = "#000000";

    /** Current linesize (default: DEFAULT_LINESIZE). */
    public linesize: number = SketchDialogComponent.DEFAULT_LINESIZE;

    /**
     * Constructor for SketchDialogComponent.
     *
     * @param _dialogRef
     * @param _data
     */
    constructor(private _dialogRef: MatDialogRef<SketchDialogComponent>, @Inject(MAT_DIALOG_DATA) private _data : any) {
        _dialogRef.disableClose = true;
    }

    /**
     * Lifecycle Hook (onInit): Loads the injected image data (if specified).
     */
    public ngOnInit(): void {
        if(this._data && typeof this._data === 'string')  {
            this._sketchpad.setImageBase64(<string>this._data);
            this._data = null;
        }
    }

    /**
     * Lifecycle Hook (afterViewIniti): Sets the default linesize and colour.
     */
    public ngAfterViewInit(): void {
        this._sketchpad.setLineSize(this.linesize);
        this._sketchpad.setActiveColor(this.color);
    }

    /**
     * Change listener for the input field (File chooser). Handles the
     * image upload.
     *
     * @param event
     */
    public onFileAvailable(event: any) {
        this._sketchpad.setImageBase64(window.URL.createObjectURL(event.target.files[0]));
        this.imageloader.nativeElement.value = null;
    };

    /**
     * Triggered when a color value is selected.
     *
     * @param color
     */
    public onColorChange() {
        this._sketchpad.setActiveColor(this.color);
    }

    /**
     * Triggered when the slider-value for the line-size changes.
     */
    public onLineSizeChange() {
        this._sketchpad.setLineSize(this.linesize);
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