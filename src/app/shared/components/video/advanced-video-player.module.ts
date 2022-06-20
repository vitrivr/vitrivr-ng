import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

import {AdvancedMediaPlayerComponent} from './advanced-media-player.component';
import {MaterialModule} from '../../../material.module';
import {CompetitionModule} from '../../../core/competition/competition.module';
import {VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';
import {PipesModule} from '../../pipes/pipes.module';

@NgModule({
  imports: [MaterialModule, CommonModule, BrowserModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, CompetitionModule, PipesModule],
  declarations: [AdvancedMediaPlayerComponent],
  exports: [AdvancedMediaPlayerComponent],
  bootstrap: [AdvancedMediaPlayerComponent]
})
export class AdvancedMediaPlayerModule {
}
