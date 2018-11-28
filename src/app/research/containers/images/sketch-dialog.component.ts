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

    /** List of preset colors. */
    public readonly preset = [
        '#FF6347', '#FF4500', '#FF0000', '#DC143C','#B22222' ,'#8B0000', /* Red colors. */
        '#00FF00', '#32CD32', '#00FF00', '#ADFF2F','#6B8E23' ,'#556B2F', /* Green colors */
        '#87CEFA', '#00BFFF', '#0000FF', '#0000CD','#00008B' ,'#191970', /* Blue colors */
        '#E0FFFF', '#AFEEEE', '#00FFFF', '#7FFFD4','#40E0D0' ,'#00CED1', /* Cyan colors */
        '#DDA0DD', '#EE82EE', '#FF00FF', '#BA55D3','#9400D3' ,'#800080', /* Magenta colors */
        '#FFFFE0', '#FAFACD', '#FFFF00', '#F0E68C','#FFE4B5' ,'#FFD700', /* Yellow colors */
        '#FFFFFF', '#DCDCDC', '#C0C0C0', '#808080', '#696969', '#000000', /* B & W. */
        '#8D5524', '#C68642', '#E0AC69', '#F1C27D', '#FFDBAC', '#FFD9C2' /* Skin tones. */
    ];

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