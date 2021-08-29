import {Component, Input, QueryList, ViewChildren} from '@angular/core';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {Config} from '../../shared/model/config/config.model';
import {Observable} from 'rxjs';
import {TemporalDistanceComponent} from '../temporal-distance/temporal-distance.component';
import {AppConfig} from '../../app.config';
import {QueryTerm} from '../../../../openapi/cineast';

@Component({
  selector: 'app-query-container',
  templateUrl: 'query-container.component.html',
  styleUrls: ['./query-container.component.css']
})

export class QueryContainerComponent {
  /** The StagedQueryContainer this QueryContainerComponent is associated to. */
  @Input() containerModel: QueryContainerInterface;

  /** A reference to the lists of QueryContainers (to enable removing the container). */
  @Input() inList: QueryContainerInterface[];

  @ViewChildren(TemporalDistanceComponent) temporalDistances: QueryList<TemporalDistanceComponent>;

  /** A reference to the observable Config exposed by ConfigService. */
  private readonly _config: Observable<Config>;

  /**
   * Constructor; injects ConfigService
   *
   * @param {AppConfig} _configService
   */
  constructor(_configService: AppConfig) {
    this._config = _configService.configAsObservable;
  }

  /**
   * Getter for config.
   *
   * @return {Config}
   */
  get config(): Observable<Config> {
    return this._config;
  }

  /**
   * Returns true if this container is no the first one
   */
  get isNotFirst(): boolean {
    return this.index > 0;
  }

  /**
   * Returns true if this container is not the last one
   */
  get isNotLast(): boolean {
    return this.index > -1 && this.index < this.inList.length - 1;
  }

  private get index(): number {
    return this.inList.indexOf(this.containerModel);
  }

  /**
   * Triggered, when a user clicks the remove-button (top-right corner). Removes
   * the QueryContainerComponent from the list.
   */
  public onRemoveButtonClicked() {
    const index = this.inList.indexOf(this.containerModel);
    if (index > -1) {
      this.inList.splice(index, 1)
    }
  }

  public onToggleButtonClicked(type: QueryTerm.TypeEnum) {
    if (this.containerModel.hasTerm(type)) {
      this.containerModel.removeTerm(type);
    } else {
      this.containerModel.addTerm(type);
    }
  }

  /**
   * Handler to move this query container one up (in the list of query containers)
   */
  public moveQueryContainerUp() {
    console.log(`[QueryC.up] Before = ${this.inList}`);
    if (this.isNotFirst) {
      const index = this.index;
      const container = this.inList[index - 1];
      this.inList[index - 1] = this.containerModel;
      this.inList[index] = container;
    }
    console.log(`[QueryC.up] After = ${this.inList}`)
  }

  public moveQueryContainerDown() {
    console.log(`[QueryC.down] Before = ${this.inList}`);
    if (this.isNotLast) {
      const index = this.index;
      const container = this.inList[index + 1];
      this.inList[index + 1] = this.containerModel;
      this.inList[index] = container;
    }
    console.log(`[QueryC.down] After = ${this.inList}`)
  }
}
