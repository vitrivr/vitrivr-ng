import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {ObjectviewerComponent} from '../objectdetails/objectviewer.component';
import {PageEvent} from "@angular/material/paginator";


@Component({
  selector: 'app-collection',
  templateUrl: 'collection.component.html',
  styleUrls: []
})
export class CollectionComponent implements AfterViewInit {

  _loading = true

  /** will be dynamically updated based on the number of objects in the collection */
  length = 2; //TODO fix to 1 for PR
  /** magic number, options are available */
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];

  private _index = 0;

  constructor(
      private _query: QueryService,
  ) {

  }

  ngAfterViewInit() {
    //TODO adjust length
    this.fetchInformation()
  }

  /**
   * We only care about the index, if it changes we need to load new content.
   */
  pagination(event: PageEvent) {
    if (event.pageIndex != this._index) {
      this._index = event.pageIndex;
      this.fetchInformation();
    }
  }

  private fetchInformation() {
    this._loading = true
    // TODO load information
    this._loading = false
  }
}
