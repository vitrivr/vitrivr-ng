import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {RefinementComponent} from "./refinement.component";
import {WeightDistributionComponent} from "./weightdistribution.component";


@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule.forRoot()],
    declarations: [ RefinementComponent, WeightDistributionComponent ],
    exports:      [ RefinementComponent ]
})

export class FeaturesModule {

}
