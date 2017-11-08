import {NgModule}      from '@angular/core';
import {MetadataLookupService} from "./metadata-lookup.service";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
    imports:      [ HttpClientModule ],
    declarations: [ ],
    providers:    [ MetadataLookupService ]
})

export class LookupModule { }
