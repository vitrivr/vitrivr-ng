import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SketchComponent } from "./sketch.component";
import { FormsModule } from "@angular/forms";
import { MaterialModule, MdButtonModule } from "@angular/material";
import { SketchDialogComponent } from "./sketchdialog.component";

@NgModule({
    imports:      [ BrowserModule, FormsModule,  MaterialModule.forRoot(), MdButtonModule],
    declarations: [ SketchComponent, SketchDialogComponent ],
    entryComponents: [SketchDialogComponent]
})
export class SketchModule { }
