import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {M3DLoaderComponent} from './m3d-loader.component';


@NgModule({
  imports: [BrowserModule, FormsModule],
  declarations: [M3DLoaderComponent],
  exports: [M3DLoaderComponent]
})

export class M3DLoaderModule {
}
