import {Component, ViewChild, AfterViewInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TrackingSketchCanvasComponent} from "../../../shared/components/sketch/tracking-sketch-canvas.component";
import {MotionData} from "./model/motion-data.model";
import {MotionArrowFactory} from "./model/motion-arrow-factory.model";
@Component({
    moduleId: module.id,
    selector: 'motion-sketchpad',
    templateUrl: 'motion-sketch-dialog.component.html',
})
export class MotionSketchDialogComponent implements AfterViewInit {
    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private _sketchpad: TrackingSketchCanvasComponent;

    /** The factory for the drawable items. */
    private _factory: MotionArrowFactory = new MotionArrowFactory();

    /**
     *
     * @param _dialogRef
     */
    constructor(private _dialogRef: MdDialogRef<MotionSketchDialogComponent>) {
        this.onToggleFrontClicked();
    }

    /**
     * Lifecycle Hook (afterViewIniti): Sets the default linesize and colour.
     */
    public ngAfterViewInit(): void {
        this._sketchpad.factory = this._factory;
    }

    /**
     * Triggered whenever someone clicks the 'Clear canvas' button.
     */
    public onClearCanvasClicked() {
        this._sketchpad.clear();
    }

    /**
     * Triggered whenever someone clicks the 'Foreground motion' button.
     */
    public onToggleFrontClicked() {
        this._factory.type = "FOREGROUND";
    }

    /**
     * Triggered whenever someone clicks the 'Background motion' button.
     */
    public onToggleBackClicked() {
        this._factory.type = "BACKGROUND";
    }

    /**
     *  Triggered whenever someone clicks the 'Save' button; Closes the dialog.
     */
    public onSaveClicked() {
        let data = <MotionData>{image: this._sketchpad.getImageBase64(), data: this._sketchpad.drawables};
        this._dialogRef.close(data);
    }

    /**
     * Getter for the currently active MotionType.
     *
     * @return {MotionType}
     */
    public get type() {
        return this._factory.type;
    }
}