import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../material.module';
import {BoolQueryTermComponent} from './bool-query-term.component';
import {BoolTermModule} from './individual/bool-term.module';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, BoolTermModule],
  declarations: [BoolQueryTermComponent],
  exports: [BoolQueryTermComponent],
  entryComponents: []
})
export class BoolQueryTermModule {
}
