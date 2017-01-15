import {Component, ViewChild} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {SketchComponent} from "./sketch.component";

@Component({
    selector: 'sketch-dialog-component',
    template: `
       <h2 md-dialog-title>Create image</h2>
       <md-dialog-content>
            <sketch #sketch></sketch>
       </md-dialog-content>
       <md-dialog-actions>
            <button (click)="dialogRef.close(sketchpad.getImageBase64())"md-button>Save</button>
       </md-dialog-actions>
    `
})
export class SketchDialogComponent {
    @ViewChild('sketch') sketchpad: SketchComponent;
    constructor(public dialogRef: MdDialogRef<SketchDialogComponent>) {

    }
}