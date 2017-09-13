import 'hammerjs';

import {NgModule} from "@angular/core";
import {
    MdSliderModule, MdChipsModule, MdDialogModule, MdCardModule, MdSidenavModule, MdSelectModule, MdTabsModule,
    MdRadioModule, MdIconModule, MdMenuModule, MdInputModule, MdToolbarModule, MdTooltipModule, MdSnackBarModule,
    MdCheckboxModule, MdButtonModule, MdCommonModule, MdGridListModule, MdProgressBarModule, MdRippleModule,
    MdProgressSpinnerModule, MdSlideToggleModule, MdIconRegistry
} from "@angular/material";
import {HttpModule} from "@angular/http";

const MATERIAL_MODULES = [
    MdButtonModule,
    MdCardModule,
    MdChipsModule,
    MdCheckboxModule,
    MdDialogModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdMenuModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdRippleModule,
    MdSelectModule,
    MdSidenavModule,
    MdSliderModule,
    MdSlideToggleModule,
    MdSnackBarModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    MdCommonModule
];


@NgModule({
    imports: [ MATERIAL_MODULES, HttpModule ],
    exports: [ MATERIAL_MODULES, HttpModule ],
    providers: [ MdIconRegistry ]
})
export class MaterialModule { }

