
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {QueryContainerComponent} from "./query-container.component";
import {ImageQueryTermModule} from "./images/image-query-term.module";
import {AudioQueryTermModule} from "./audio/audio-query-term.module";
import {M3DQueryTermModule} from "./m3d/m3d-query-term.module";
import {MaterialModule} from "../../material.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, ImageQueryTermModule, AudioQueryTermModule, M3DQueryTermModule ],
    declarations: [ QueryContainerComponent ],
    exports:      [ QueryContainerComponent ]
})

export class QueryContainerModule { }
