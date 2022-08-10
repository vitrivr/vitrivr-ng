import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../../material.module';
import {BoolTermComponent} from './bool-term.component';
import {NgxSliderModule} from '@angular-slider/ngx-slider';
import {MatButtonToggleModule} from "@angular/material/button-toggle";

@NgModule({
    imports: [MaterialModule, BrowserModule, FormsModule, NgxSliderModule, MatButtonToggleModule],
  declarations: [BoolTermComponent],
  exports: [BoolTermComponent],
})
export class BoolTermModule {
}
