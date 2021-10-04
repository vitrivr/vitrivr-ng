import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../app-routing.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {M3DLoaderModule} from '../shared/components/m3d/m3d-loader-module';

import {MaterialModule} from '../material.module';
import {AdvancedMediaPlayerModule} from '../shared/components/video/advanced-video-player.module';
import {SegmentdetailsComponent} from './segmentdetails.component';
import {SegmentFeaturesComponent} from './segment-features.component';
import {PipesModule} from '../shared/pipes/pipes.module';

@NgModule({
  imports: [MaterialModule, FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule, AdvancedMediaPlayerModule, PipesModule],
  declarations: [SegmentFeaturesComponent],
  exports: [SegmentFeaturesComponent],
})

export class SegmentfeaturesModule {
}
