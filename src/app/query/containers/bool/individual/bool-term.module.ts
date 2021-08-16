import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../../../material.module';
import {BoolTermComponent} from './bool-term.component';
import {NgxSliderModule} from '@angular-slider/ngx-slider';
import { BoolTermChartComponent } from './bool-term-chart/bool-term-chart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, NgxSliderModule, NgxChartsModule],
  declarations: [BoolTermComponent,  BoolTermChartComponent],
  exports: [BoolTermComponent],
})
export class BoolTermModule {
}
