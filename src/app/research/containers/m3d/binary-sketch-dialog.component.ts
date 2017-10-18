import {Component, ViewChild, HostListener, AfterViewInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SketchCanvas} from "../../../shared/components/sketch/sketch-canvas.component";

@Component({
    moduleId: module.id,
    selector: 'binary-sketchpad',
    templateUrl: 'binary-sketch-dialog.component.html'
})

export class BinarySketchDialogComponent implements AfterViewInit {
    /** Default linesize when opening the dialog. */
    public static readonly DEFAULT_LINESIZE = 10.0;

    /** Hidden input for image upload. */
    @ViewChild('imageloader')
    private imageloader: any;

    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private _sketchpad: SketchCanvas;

    /** Default color (black) . */
    public color : string = "#FFFFFF";

    /** Current linesize (default: DEFAULT_LINESIZE). */
    public linesize: number = BinarySketchDialogComponent.DEFAULT_LINESIZE;

    /**
     *
     * @param _dialogRef
     * @param _data
     */
    constructor(private _dialogRef: MatDialogRef<BinarySketchDialogComponent>, @Inject(MAT_DIALOG_DATA) private _data : any) {}

    /**
     * Invoked after initialization. Loads the injected image data (if specified).
     */
    public ngAfterViewInit(): void {
        if(this._data && typeof this._data === 'string')  {
            this._sketchpad.setImageBase64(<string>this._data);
            this._data = null;
        } else {
            this._sketchpad.setActiveColor("#000000");
            this._sketchpad.fillCanvas();
            this._sketchpad.setActiveColor("#FFFFFF");
        }
        this._sketchpad.setLineSize(this.linesize);
    }

    /**
     * Closes the dialog.
     */
    public close() {
        this._dialogRef.close(this._sketchpad.getImageBase64())
    }

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
    public onLineSizeChange() {
        this._sketchpad.setLineSize(this.linesize);
    }

    /**
     * Triggered when the 'Clear canvas' menu-item is pressed.
     *
     * Clears the canvas
     */
    public onClearCanvasClicked() {
        this._sketchpad.setActiveColor("#000000");
        this._sketchpad.fillCanvas();
        this._sketchpad.setActiveColor("#FFFFFF");
    }

    /**
     * Triggered when the 'Fill canvas' menu-item is pressed.
     *
     * Fills the canvas with the default color.
     */
    public onFillCanvasClicked() {
        this._sketchpad.fillCanvas();
    }
}