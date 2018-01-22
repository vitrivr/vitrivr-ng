import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";

import { VgCoreModule } from "videogular2/core";
import { VgOverlayPlayModule } from "videogular2/overlay-play";
import { VgControlsModule } from "videogular2/controls";
import { VgBufferingModule } from "videogular2/buffering";

import {AdvancedMediaPlayerComponent} from "./advanced-media-player.component";
import {MaterialModule} from "../../../material.module";

@NgModule({
    imports:      [ MaterialModule, CommonModule, BrowserModule, VgCoreModule, VgControlsModule, VgOverlayPlayModule, VgBufferingModule ],
    declarations: [ AdvancedMediaPlayerComponent ],
    exports: [ AdvancedMediaPlayerComponent]
})
export class AdvancedMediaPlayerModule { }
