import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';

import {AdvancedMediaPlayerComponent} from './advanced-media-player.component';
import {MaterialModule} from '../../../material.module';
import {VbsModule} from '../../../core/vbs/vbs.module';
import {VgOverlayPlayModule} from 'videogular2/compiled/src/overlay-play/overlay-play';
import {VgCoreModule} from 'videogular2/compiled/src/core/core';
import {VgControlsModule} from 'videogular2/compiled/src/controls/controls';
import {VgBufferingModule} from 'videogular2/compiled/src/buffering/buffering';

@NgModule({
  imports: [MaterialModule, CommonModule, BrowserModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule, VbsModule],
  declarations: [AdvancedMediaPlayerComponent],
  exports: [AdvancedMediaPlayerComponent]
})
export class AdvancedMediaPlayerModule {
}
