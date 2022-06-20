import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {GalleryComponent} from './gallery.component';
import {AppRoutingModule} from '../../app-routing.module';
import {MaterialModule} from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {MiniGalleryComponent} from './mini-gallery.component';
import {PipesModule} from '../../shared/pipes/pipes.module';
import {CompetitionModule} from '../../core/competition/competition.module';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ResultSegmentPreviewTileModule} from '../result-segment-preview-tile/result-segment-preview-tile.module';
import {VgCoreModule} from '@videogular/ngx-videogular/core';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, AppRoutingModule, FlexLayoutModule, PipesModule, InfiniteScrollModule, CompetitionModule, VgCoreModule, ResultSegmentPreviewTileModule],
  declarations: [GalleryComponent, MiniGalleryComponent],
  exports: [GalleryComponent, MiniGalleryComponent]
})
export class GalleryModule {
}
