import {NgModule}      from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EvaluationComponent} from "./evaluation.component";
import {AppRoutingModule} from "../app-routing.module";
import {EvaluationSelectionComponent} from "./evaluation-selection.component";
import {ScenarioDetailsDialogComponent} from "./scenario-details-dialog.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import {EvaluationHistory} from "./evaluation-history.component";
import {ScenarioDetailsComponent} from "./scenario-details.component";
import {MaterialModule} from "../material.module";
import {ContainerPipesModule} from "../shared/pipes/containers/container-pipes.module";
import {InfiniteScrollModule} from "ngx-infinite-scroll";

@NgModule({
    imports:      [ BrowserModule, FormsModule, ReactiveFormsModule, MaterialModule, AppRoutingModule, FlexLayoutModule, ContainerPipesModule, InfiniteScrollModule ],
    declarations: [ EvaluationComponent, EvaluationSelectionComponent, EvaluationHistory, ScenarioDetailsComponent, ScenarioDetailsDialogComponent ],
    exports: [ EvaluationComponent, EvaluationSelectionComponent ],
    entryComponents: [ScenarioDetailsDialogComponent ]
})

export class EvaluationModule { }
