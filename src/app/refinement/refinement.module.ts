import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {RefinementComponent} from "./refinement.component";
import {WeightDistributionComponent} from "./weightdistribution.component";
import {MaterialModule} from "../material.module";


@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule],
    declarations: [ RefinementComponent, WeightDistributionComponent ],
    exports:      [ RefinementComponent ]
})

export class FeaturesModule {

}
