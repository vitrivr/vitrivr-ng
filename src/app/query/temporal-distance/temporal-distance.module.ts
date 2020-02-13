import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TemporalDistanceComponent} from './temporal-distance.component';
import {MaterialModule} from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {FormsModule} from '@angular/forms';

@NgModule({
  declarations: [TemporalDistanceComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FlexLayoutModule,
    FormsModule
  ],
  exports: [
    TemporalDistanceComponent
  ]
})
export class TemporalDistanceModule {
}
