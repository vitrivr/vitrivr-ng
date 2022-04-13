import {AfterViewInit, ChangeDetectorRef, Component} from '@angular/core';
import {QueryService} from '../core/queries/query.service';
import {PageEvent} from "@angular/material/paginator";
import {MediaObjectDescriptor, MediaObjectMetadataDescriptor, MetadataService, MiscService, ObjectService} from "../../../openapi/cineast";
import {animate, state, style, transition, trigger} from '@angular/animations';


/**
 * Expandable rows taken from Angular Material Examples: https://material.angular.io/components/table/examples
 */
@Component({
  selector: 'app-collection',
  templateUrl: 'collection.component.html',
  styleUrls: ['collection.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ],
})
export class CollectionComponent implements AfterViewInit {

  columnsToDisplay: string[] = ['objectid', 'name', 'mediatype', 'path']
  detailColumnsToDisplay: string[] = ['objectid', 'domain', 'key', 'value']

  _loading = true
  _loadingMetadata = false

  /** will be dynamically updated based on the number of objects in the collection */
  length = 0
  /** magic number, options are available */
  pageSize = 10
  pageSizeOptions: number[] = [5, 10, 25, 100]

  data: MediaObjectDescriptor[] = []
  detailData: MediaObjectMetadataDescriptor[] = []

  private _index = 0
  expandedElement: MediaObjectMetadataDescriptor | null

  constructor(
      private _query: QueryService,
      private _object: ObjectService,
      private _misc: MiscService,
      private _metadata: MetadataService,
      private _cdr: ChangeDetectorRef
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
      this.data = result.content
      this._loading = false
    })
  }

  private fetchMetadata() {
    this._loadingMetadata = true
    console.log(this.expandedElement.objectid)
    this._metadata.findMetaById(this.expandedElement.objectid).subscribe(result => {
      console.log(result)
      this.detailData = result.content
      this._loadingMetadata = false
      this._cdr.detectChanges()
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
    this.fetchInformation()
  }

  toggleRow(element: MediaObjectMetadataDescriptor) {
    this.expandedElement = this.expandedElement === element ? null : element
    this.detailData = []
    this.fetchMetadata()
  }
}
