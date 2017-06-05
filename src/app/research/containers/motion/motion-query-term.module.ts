import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from "../../../material.module";
import {MotionQueryTermComponent} from "./motion-query-term.component";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule ],
    declarations: [ MotionQueryTermComponent ],
    exports:      [ MotionQueryTermComponent ],
    entryComponents: [  ]
})
export class MotionQueryTermModule { }
