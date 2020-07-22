import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {PoseSvgComponent} from './pose-svg.component';
import {SkelSelectorComponent} from './skel-selector.component';
import {MaterialModule} from '../../../material.module';

@NgModule({
  imports: [BrowserModule, FormsModule, MaterialModule],
  declarations: [PoseSvgComponent, SkelSelectorComponent],
  exports: [PoseSvgComponent, SkelSelectorComponent]
})
export class PoseModule {
}
