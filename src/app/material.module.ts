import 'hammerjs';

import {NgModule} from "@angular/core";
import {
    MatSliderModule, MatChipsModule, MatDialogModule, MatCardModule, MatSidenavModule, MatSelectModule, MatTabsModule,
    MatRadioModule, MatIconModule, MatMenuModule, MatInputModule, MatToolbarModule, MatTooltipModule, MatSnackBarModule,
    MatCheckboxModule, MatButtonModule, MatCommonModule, MatGridListModule, MatProgressBarModule, MatRippleModule,
    MatProgressSpinnerModule, MatSlideToggleModule, MatIconRegistry
} from "@angular/material";
import {HttpModule} from "@angular/http";

const MATERIAL_MODULES = [
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
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
    imports: [ MATERIAL_MODULES, HttpModule ],
    exports: [ MATERIAL_MODULES, HttpModule ],
    providers: [ MatIconRegistry ]
})
export class MaterialModule { }

