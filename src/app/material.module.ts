import 'hammerjs';

import {NgModule} from "@angular/core";
import {HttpClientModule} from "@angular/common/http";
import {
    MatSliderModule, MatChipsModule, MatDialogModule, MatCardModule, MatSidenavModule, MatSelectModule, MatTabsModule,
    MatRadioModule, MatIconModule, MatMenuModule, MatInputModule, MatToolbarModule, MatTooltipModule, MatSnackBarModule,
    MatCheckboxModule, MatButtonModule, MatCommonModule, MatGridListModule, MatProgressBarModule, MatRippleModule,
    MatProgressSpinnerModule, MatSlideToggleModule, MatIconRegistry, MatListModule
} from "@angular/material";

const MATERIAL_MODULES = [
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
    imports: [ MATERIAL_MODULES, HttpClientModule ],
    exports: [ MATERIAL_MODULES, HttpClientModule ],
    providers: [ MatIconRegistry ]
})
export class MaterialModule { }

