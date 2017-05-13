import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';

import {ResearchComponent} from "./research.component";
import {SketchModule} from "../shared/components/sketch/sketch.module";
import {QueryContainerModule} from "./containers/query-container.module";
import {MaterialModule} from "../material.module";

@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, SketchModule, QueryContainerModule ],
    declarations: [ ResearchComponent ],
    exports:      [ ResearchComponent ]
})

export class ResearchModule { }
