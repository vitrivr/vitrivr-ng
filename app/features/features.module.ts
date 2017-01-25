import {MaterialModule} from '@angular/material';
import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {FeaturesComponent} from "./features.component";
import {WeightDistributionComponent} from "./weightdistribution.component";


@NgModule({
    imports:      [ BrowserModule, FormsModule, MaterialModule.forRoot()],
    declarations: [ FeaturesComponent, WeightDistributionComponent ],
    exports:      [ FeaturesComponent ]
})

export class FeaturesModule {

}
