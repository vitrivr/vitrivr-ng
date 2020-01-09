import 'hammerjs';

import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {
  MatAutocompleteModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatCommonModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatIconRegistry,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule
} from '@angular/material';

const MATERIAL_MODULES = [
  MatAutocompleteModule,
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatChipsModule,
  MatCheckboxModule,
  MatDialogModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
  MatCommonModule
];


@NgModule({
  imports: [MATERIAL_MODULES, HttpClientModule],
  exports: [MATERIAL_MODULES, HttpClientModule],
  providers: [MatIconRegistry]
})
export class MaterialModule {
}

