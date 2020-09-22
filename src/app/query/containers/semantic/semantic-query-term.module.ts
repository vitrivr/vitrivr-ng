import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {SemanticQueryTermComponent} from './semantic-query-term.component';
import {SemanticSketchDialogComponent} from './semantic-sketch-dialog.component';
import {SketchModule} from '../../../shared/components/sketch/sketch.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, ReactiveFormsModule, SketchModule],
  declarations: [SemanticQueryTermComponent, SemanticSketchDialogComponent],
  exports: [SemanticQueryTermComponent],
})

export class SemanticQueryTermModule {
}
