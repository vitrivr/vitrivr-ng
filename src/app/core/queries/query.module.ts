import {NgModule} from '@angular/core';
import {QueryService} from './query.service';
import {FilterService} from './filter.service';
import {HistoryService} from './history.service';

@NgModule({
  imports: [],
  declarations: [],
  providers: [QueryService, FilterService, HistoryService]
})
export class QueryModule {
}
