import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from "../../app-routing.module";
import {MaterialModule} from "../../material.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {ListComponent} from "./list.component";
import {ContainerPipesModule} from "../../shared/pipes/containers/container-pipes.module";
import {VbsModule} from "../../core/vbs/vbs.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, AppRoutingModule, FlexLayoutModule, ContainerPipesModule, VbsModule ],
    declarations: [ ListComponent ],
    exports: [ ListComponent ]
})
export class ListModule { }
