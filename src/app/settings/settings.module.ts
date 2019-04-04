import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {RefinementComponent} from "./refinement/refinement.component";
import {WeightDistributionComponent} from "./refinement/weightdistribution.component";
import {MaterialModule} from "../material.module";
import {SettingsComponent} from "./settings.component";
import {SelectionManagementComponent} from "./selection/selection-management.component";
import {PreferencesComponent} from "./preferences/preferences.component";
import {FlexLayoutModule} from "@angular/flex-layout";
import {Ng5SliderModule} from 'ng5-slider';
@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule, FlexLayoutModule, Ng5SliderModule],
    declarations: [ RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent, WeightDistributionComponent ],
    exports:      [ RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent]
})
export class SettingsModule {

}
