import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {MaterialModule} from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {TemporalDistanceModule} from '../temporal-distance/temporal-distance.module';
import {TemporalModeContainerComponent} from './temporal-mode-container.component';

@NgModule({
  imports: [
    MaterialModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    TemporalDistanceModule,
  ],
  declarations: [TemporalModeContainerComponent],
  exports: [TemporalModeContainerComponent]
})

export class TemporalModeContainerModule {
}
