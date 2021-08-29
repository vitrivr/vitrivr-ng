import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {RefinementComponent} from './refinement/refinement.component';
import {WeightDistributionComponent} from './refinement/weightdistribution.component';
import {MaterialModule} from '../material.module';
import {SettingsComponent} from './settings.component';
import {SelectionManagementComponent} from './selection/selection-management.component';
import {PreferencesComponent} from './preferences/preferences.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ContainerPipesModule} from '../shared/pipes/containers/container-pipes.module';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import {MatBadgeModule} from '@angular/material/badge';
import { InformationComponent } from './information/information.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {GoogleChartsModule} from 'angular-google-charts';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, FlexLayoutModule, NgxSliderModule, ContainerPipesModule, MatButtonToggleModule, MatBadgeModule, ReactiveFormsModule, GoogleChartsModule],
  declarations: [RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent, WeightDistributionComponent, InformationComponent],
  exports: [RefinementComponent, SettingsComponent, SelectionManagementComponent, PreferencesComponent]
})
export class SettingsModule {

}
