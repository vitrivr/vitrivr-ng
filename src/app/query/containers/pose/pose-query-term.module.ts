import {NgModule} from "@angular/core";
import {MaterialModule} from "../../../material.module";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule} from "@angular/forms";
import {PoseQueryTermComponent} from "./pose-query-term.component";
import {PoseSketchDialogComponent} from "./pose-sketch-dialog.component";

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule],
  declarations: [PoseQueryTermComponent, PoseSketchDialogComponent],
  exports: [PoseQueryTermComponent]
})

export class PoseQueryTermModule {
}
