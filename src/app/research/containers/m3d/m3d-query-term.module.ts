import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {M3DQueryTermComponent} from "./m3d-query-term.component";
import {M3DLoaderDialogComponent} from "./m3d-loader-dialog.component";
import {M3DLoaderModule} from "../../../shared/components/m3d/m3d-loader-module";
import {MaterialModule} from "../../../material.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, M3DLoaderModule],
    declarations: [ M3DQueryTermComponent, M3DLoaderDialogComponent ],
    exports:      [ M3DQueryTermComponent ],
    entryComponents: [ M3DLoaderDialogComponent ]
})

export class M3DQueryTermModule { }
