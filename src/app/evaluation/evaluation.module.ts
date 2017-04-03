import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {EvaluationComponent} from "./evaluation.component";
import {AppRoutingModule} from "../app-routing.module";

@NgModule({
    imports:      [ BrowserModule, FormsModule, ReactiveFormsModule, MaterialModule, AppRoutingModule ],
    declarations: [ EvaluationComponent ],
    exports: [ EvaluationComponent ]
})

export class EvaluationModule { }
