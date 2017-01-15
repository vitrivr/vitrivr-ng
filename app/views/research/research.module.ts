import {MaterialModule, MdDialog} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {ResearchComponent} from "./research.component";
import {ImageQueryTermComponent} from "./imagequeryterm.component";
import {SketchModule} from "../sketch/sketch.module";
import {SketchDialogComponent} from "../sketch/sketchdialog.component";
import {QueryContainerComponent} from "./querycontainer.component";

@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule.forRoot(), SketchModule],
    declarations: [ ResearchComponent, QueryContainerComponent, ImageQueryTermComponent ],
    exports:      [ ResearchComponent ],
    providers:    [ SketchDialogComponent ]
})

export class ResearchModule { }
