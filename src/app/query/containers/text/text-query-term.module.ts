import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {TextQueryTermComponent} from './text-query-term.component';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule],
  declarations: [TextQueryTermComponent],
  exports: [TextQueryTermComponent],
  entryComponents: []
})
export class TextQueryTermModule {
}
