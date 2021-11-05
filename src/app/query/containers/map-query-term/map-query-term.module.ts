import {NgModule} from '@angular/core';
import {MaterialModule} from '../../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MapQueryTermComponent} from './map-query-term.component';
import { MapDialogComponent } from './map-dialog/map-dialog.component';

@NgModule({
  imports: [MaterialModule, FlexLayoutModule, BrowserModule, FormsModule, ReactiveFormsModule, MatButtonToggleModule],
  declarations: [MapQueryTermComponent, MapDialogComponent],
  exports: [MapQueryTermComponent],
})
export class MapQueryTermModule {
}
