import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TemporalDistanceModule} from '../temporal-distance/temporal-distance.module';
import {TemporalLengthContainerComponent} from './temporal-length-container.component';

@NgModule({
  imports: [
    MaterialModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    TemporalDistanceModule,
  ],
  declarations: [TemporalLengthContainerComponent],
  exports: [TemporalLengthContainerComponent]
})

export class TemporalLengthContainerModule {
}
