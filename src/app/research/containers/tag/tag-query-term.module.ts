import {NgModule}      from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from "../../../material.module";
import {TagQueryTermComponent} from "./tag-query-term.component";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
    imports:      [ MaterialModule, FlexLayoutModule, BrowserModule, FormsModule, ReactiveFormsModule ],
    declarations: [ TagQueryTermComponent ],
    exports:      [ TagQueryTermComponent ],
    entryComponents: [ ]
})
export class TagQueryTermModule { }
