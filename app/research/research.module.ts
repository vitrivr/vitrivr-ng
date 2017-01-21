import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {ResearchComponent} from "./research.component";
import {SketchModule} from "../shared/components/sketch/sketch.module";
import {QueryContainerModule} from "./containers/query-container.module";

@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule.forRoot(), SketchModule, QueryContainerModule ],
    declarations: [ ResearchComponent ],
    exports:      [ ResearchComponent ]
})

export class ResearchModule { }
