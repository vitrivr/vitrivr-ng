import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from '../../app-routing.module';
import {MaterialModule} from '../../material.module';
import {FlexLayoutModule} from '@angular/flex-layout';
import {ListComponent} from './list.component';
import {PipesModule} from '../../shared/pipes/pipes.module';
import {VbsModule} from '../../core/vbs/vbs.module';
import {InfiniteScrollModule} from 'ngx-infinite-scroll';
import {ResultSegmentPreviewTileModule} from '../result-segment-preview-tile/result-segment-preview-tile.module';
import {VgCoreModule} from '@videogular/ngx-videogular/core';

@NgModule({
  imports: [MaterialModule, BrowserModule, FormsModule, AppRoutingModule, FlexLayoutModule, PipesModule, VbsModule, InfiniteScrollModule, VgCoreModule, ResultSegmentPreviewTileModule],
  declarations: [ListComponent],
  exports: [ListComponent]
})
export class ListModule {
}
