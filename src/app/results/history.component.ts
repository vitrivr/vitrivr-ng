import {Component} from '@angular/core';
import {HistoryService} from '../core/queries/history.service';
import {Observable} from 'rxjs';
import {HistoryContainer} from '../shared/model/internal/history-container.model';
import {QueryService} from '../core/queries/query.service';

@Component({

  selector: 'app-history',
  template: `
    <div [style.display]="'flex'">
      <h2 class="mat-h2">Query history</h2>
      <span class="spacer-flex"></span>
      <button mat-icon-button matTooltip="Clears the query history." (click)="clear()">
        <mat-icon>delete</mat-icon>
      </button>
      <button mat-icon-button matTooltip="Downloads the entire history as ZIP file." (click)="download()">
        <mat-icon>cloud_download</mat-icon>
      </button>
    </div>
    <mat-nav-list *ngIf="(_count|async) > 0">
      <a *ngFor="let result of (_history|async)" mat-list-item (click)="load(result)">
        <mat-icon mat-list-icon>change_history</mat-icon>
        <span mat-line><strong>ID: {{result.id}}, {{format(result.timestamp)}}</strong></span>
        <span mat-line>Objects: {{result.objects}}, Segments: {{result.segments}}</span>
        <span mat-line>Features: {{result.features.join(", ")}}</span>
      </a>
    </mat-nav-list>
    <p *ngIf="(_count|async) == 0">No history available!</p>
  `
})
export class HistoryComponent {

  /** Reference to the Observable exposing the list of HistoryContainers. */
  public _history: Observable<HistoryContainer[]>;

  /** Reference to the Observable exposing the number of HistoryContainers. */
  public _count: Observable<number>;

  /**
   * Constructor for HistoryComponent.
   *
   * @param _service
   * @param _query
   */
  constructor(private _service: HistoryService, private _query: QueryService) {
    this._count = _service.count;
    this._history = _service.list;
  }

  /**
   * Loads a selected HistoryContainer.
   *
   * @param snapshot The HistoryContainer to load.
   */
  public load(snapshot: HistoryContainer) {
    this._query.load(snapshot);
  }

  /**
   * Clears all entries in the query history.
   */
  public clear() {
    this._service.clear();
    this._count = this._service.count;
    this._history = this._service.list;
  }

  /**
   * Downloads the history as a ZIP file.
   */
  public download() {
    this._service.download();
  }

  /**
   * Used to format the timestamp for display reasons.
   *
   * @param timestamp The timestamp to format.
   */
  public format(timestamp: number) {
    return new Date(timestamp).toISOString()
  }
}
