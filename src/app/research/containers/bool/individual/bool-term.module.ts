import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../../material.module';
import {BoolTermComponent} from './bool-term.component';
import {Ng5SliderModule} from 'ng5-slider';

@NgModule({
    imports: [MaterialModule, BrowserModule, FormsModule, Ng5SliderModule],
    declarations: [BoolTermComponent],
    exports: [BoolTermComponent],
    entryComponents: []
})
export class BoolTermModule {
}
