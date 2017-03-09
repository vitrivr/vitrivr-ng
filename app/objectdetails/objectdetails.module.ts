import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {ObjectdetailsComponent} from "./objectdetails.component";
import {BrowserModule} from "@angular/platform-browser";
import {AppRoutingModule} from "../app-routing.module";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
    imports:      [ MaterialModule.forRoot(), FlexLayoutModule, BrowserModule, AppRoutingModule ],
    declarations: [ ObjectdetailsComponent ],
    exports: [ ObjectdetailsComponent ]
})

export class ObjectdetailsModule { }
