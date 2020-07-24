import {NgModule} from '@angular/core';
import {ObjectdetailsComponent} from './objectdetails.component';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../app-routing.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {M3DLoaderModule} from '../shared/components/m3d/m3d-loader-module';

import {MaterialModule} from '../material.module';
import {ImageCropperModule} from 'ng2-img-cropper';
import {QuickViewerComponent} from './quick-viewer.component';
import {ContainerPipesModule} from '../shared/pipes/containers/container-pipes.module';
import {AdvancedMediaPlayerModule} from '../shared/components/video/advanced-video-player.module';
import {MetadataDetailsComponent} from './metadata-details.component';

@NgModule({
  imports: [MaterialModule, FlexLayoutModule, BrowserModule, AppRoutingModule, M3DLoaderModule, ImageCropperModule, ContainerPipesModule, AdvancedMediaPlayerModule],
  declarations: [ObjectdetailsComponent, QuickViewerComponent, MetadataDetailsComponent],
  exports: [ObjectdetailsComponent, QuickViewerComponent, MetadataDetailsComponent],
  entryComponents: [QuickViewerComponent, MetadataDetailsComponent]
})

export class ObjectdetailsModule {
}
