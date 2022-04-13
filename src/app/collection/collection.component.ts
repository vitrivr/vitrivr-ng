import {AfterViewInit, Component} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {PageEvent} from "@angular/material/paginator";
import {MediaObjectDescriptor, MiscService, ObjectService} from "../../../openapi/cineast";


@Component({
  selector: 'app-collection',
  templateUrl: 'collection.component.html',
  styleUrls: ['collection.component.css']
})
export class CollectionComponent implements AfterViewInit {

  displayedColumns: string[] = ['objectid', 'filename', 'mediatype','path']

  _loading = true

  /** will be dynamically updated based on the number of objects in the collection */
  length = 0
  /** magic number, options are available */
  pageSize = 10
  pageSizeOptions: number[] = [5, 10, 25, 100]

  data: MediaObjectDescriptor[] = []

  private _index = 0

  constructor(
      private _query: QueryService,
      private _object: ObjectService,
      private _misc: MiscService
  ) {
  }

  ngAfterViewInit() {
    this._loading = true
    this._misc.countRows("cineast_multimediaobject").subscribe(res => {
      console.log(`row count: ${res.value}`)
      this.length = res.value
    })
    this.fetchInformation()
  }

  private fetchInformation() {
    this._loading = true
    const skip = this._index * this.pageSize
    const limit = this.pageSize
    this._object.findObjectsPagination(skip, limit).subscribe(result => {
      console.log(result)
      this.data = result.content
      this._loading = false
    })
  }

  /**
   * Event emitted when the paginator changes the page size or page index. Requires re-loading objects.
   *
   * There could be a smarter implementation here, e.g. pre-loading.
   */
  pagination(event: PageEvent) {
    this.pageSize = event.pageSize
    this._index = event.pageIndex
    this.fetchInformation();
  }
}
