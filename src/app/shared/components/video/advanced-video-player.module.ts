import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

import {AdvancedMediaPlayerComponent} from './advanced-media-player.component';
import {MaterialModule} from '../../../material.module';
import {VbsModule} from '../../../core/vbs/vbs.module';
import {VgCoreModule} from '@videogular/ngx-videogular/core';
import {VgControlsModule} from '@videogular/ngx-videogular/controls';
import {VgOverlayPlayModule} from '@videogular/ngx-videogular/overlay-play';
import {VgBufferingModule} from '@videogular/ngx-videogular/buffering';

@NgModule({
  imports: [MaterialModule, CommonModule, BrowserModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, VbsModule],
  declarations: [AdvancedMediaPlayerComponent],
  exports: [AdvancedMediaPlayerComponent],
  bootstrap: [AdvancedMediaPlayerComponent]
})
export class AdvancedMediaPlayerModule {
}
