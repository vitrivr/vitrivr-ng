import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {DistinctElementLookupService} from './distinct-element-lookup.service';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [DistinctElementLookupService]
})

export class LookupModule {
}
