import {NgModule} from '@angular/core';
import {ObjectdetailsComponent} from './objectdetails.component';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../app-routing.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {M3DLoaderModule} from '../shared/components/m3d/m3d-loader-module';

import {MaterialModule} from '../material.module';
import {QuickViewerComponent} from './quick-viewer.component';
import {PipesModule} from '../shared/pipes/pipes.module';
import {AdvancedMediaPlayerModule} from '../shared/components/video/advanced-video-player.module';
import {MetadataDetailsComponent} from './metadata-details.component';
import {ObjectviewerComponent} from './objectviewer.component';
import {SegmentfeaturesModule} from '../segmentdetails/segmentfeatures.module';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@NgModule({
  imports: [MaterialModule, FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule, PipesModule, AdvancedMediaPlayerModule, SegmentfeaturesModule, MatButtonToggleModule],
  declarations: [ObjectdetailsComponent, QuickViewerComponent, MetadataDetailsComponent, ObjectviewerComponent],
  exports: [ObjectdetailsComponent, QuickViewerComponent, MetadataDetailsComponent, ObjectviewerComponent],
})

export class ObjectdetailsModule {
}
