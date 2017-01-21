import {Component, ViewChild, HostListener} from '@angular/core';
import {MdDialogRef, MdSliderChange} from '@angular/material';
import {SketchCanvas} from "../../../shared/components/sketch/sketch-canvas.component";
import {ColorPickerService} from 'angular2-color-picker';

@Component({
    moduleId: module.id,
    selector: 'sketchpad',
    templateUrl: './sketch-dialog.component.html'
})
export class SketchDialogComponent {
    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private sketchpad: SketchCanvas;

    /** Hidden input for image upload. */
    @ViewChild('imageloader')
    private imageloader: any;

    private color : string = "#000000";
    constructor(public dialogRef: MdDialogRef<SketchDialogComponent>, private cpService: ColorPickerService) {

    }

    /**
     * Change listener for the input field (File chooser). Handles the
     * image upload.
     *
     * @param event
     */
    @HostListener('change', ['$event'])
    onChange(event: any) {
        let URL = window.URL;
        this.sketchpad.setImageBase64(URL.createObjectURL(event.target.files[0]))
    };

    /**
     *
     */
    public getSketchPad() : SketchCanvas {
        return this.sketchpad;
    }

    /**
     * Triggered when a color value is selected.
     *
     * @param event
     */
    private onColorChange(event:string) {
        this.color = event;
        this.sketchpad.setActiveColor(this.color);
    }

    /**
     * Triggered when the slider-value for the line-size changes.
     *
     * @param event
     */
    private onLineSizeChange(size : MdSliderChange) {
        this.sketchpad.setLineSize(size.value);
    }

    /**
     * Triggered when the 'Clear canvas' menu-item is pressed.
     *
     * Clears the canvas
     */
    private onClearCanvas() {
        this.sketchpad.clearCanvas();
    }

    /**
     * Triggered when the 'load-image' menu-item is pressed.
     *
     * Opens a file-chooser.
     */
    private onLoadImage() {
       this.imageloader.nativeElement.click();
    }
}