import {NgModule} from '@angular/core';
import {MetadataLookupService} from './metadata-lookup.service';
import {HttpClientModule} from '@angular/common/http';
import {TagsLookupService} from './tags-lookup.service';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [MetadataLookupService, TagsLookupService]
})

export class LookupModule {
}
