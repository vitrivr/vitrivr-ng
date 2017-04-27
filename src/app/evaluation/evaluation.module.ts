import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

import {EvaluationComponent} from "./evaluation.component";
import {AppRoutingModule} from "../app-routing.module";
import {EvaluationSelectionComponent} from "./evaluation-selection.component";
import {ScenarioDetailsDialogComponent} from "./scenario-details-dialog.component";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
    imports:      [ BrowserModule, FormsModule, ReactiveFormsModule, MaterialModule, AppRoutingModule, FlexLayoutModule ],
    declarations: [ EvaluationComponent, EvaluationSelectionComponent, ScenarioDetailsDialogComponent ],
    exports: [ EvaluationComponent, EvaluationSelectionComponent ],
    entryComponents: [ScenarioDetailsDialogComponent ]
})

export class EvaluationModule { }
