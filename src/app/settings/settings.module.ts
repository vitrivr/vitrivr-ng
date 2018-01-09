import {NgModule}      from '@angular/core';
import {FormsModule} from "@angular/forms";
import {BrowserModule} from '@angular/platform-browser';
import {RefinementComponent} from "./refinement/refinement.component";
import {WeightDistributionComponent} from "./refinement/weightdistribution.component";
import {MaterialModule} from "../material.module";
import {SettingsComponent} from "./settings.component";
import {SelectionManagementComponent} from "./selection/selection-management.component";
import {PreferencesComponent} from "./preferences/preferences.component";
@NgModule({
    imports:      [ MaterialModule, BrowserModule, FormsModule],
    declarations: [ RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent, WeightDistributionComponent ],
    exports:      [ RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent, ]
})
export class SettingsModule {

}
