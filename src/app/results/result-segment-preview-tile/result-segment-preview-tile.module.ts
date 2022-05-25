import {NgModule} from '@angular/core';
import {MaterialModule} from '../../material.module';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {AppRoutingModule} from '../../app-routing.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {PipesModule} from '../../shared/pipes/pipes.module';
import {CompetitionModule} from '../../core/competition/competition.module';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ResultSegmentPreviewTileComponent} from './result-segment-preview-tile.component';
import {VgCoreModule} from '@videogular/ngx-videogular/core';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, AppRoutingModule, FlexLayoutModule, PipesModule, CompetitionModule, InfiniteScrollModule, VgCoreModule],
  declarations: [ResultSegmentPreviewTileComponent],
  exports: [ResultSegmentPreviewTileComponent]
})
export class ResultSegmentPreviewTileModule {
}
