import {ChangeDetectorRef, NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../../material.module';
import {BoolTermComponent} from './bool-term.component';

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule,  ],
    declarations: [ BoolTermComponent ],
    exports:      [ BoolTermComponent ],
    entryComponents: [ ]
})
export class BoolTermModule { }
