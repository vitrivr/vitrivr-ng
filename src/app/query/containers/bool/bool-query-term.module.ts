import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {BoolQueryTermComponent} from './bool-query-term.component';
import {BoolTermModule} from './individual/bool-term.module';
import {NgxSliderModule} from '@angular-slider/ngx-slider';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, BoolTermModule, NgxSliderModule],
  declarations: [BoolQueryTermComponent],
  exports: [BoolQueryTermComponent],
})
export class BoolQueryTermModule {
}
