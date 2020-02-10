import {Component, Input} from '@angular/core';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {QueryTermType} from '../../shared/model/queries/interfaces/query-term-type.interface';
import {ConfigService} from '../../core/basics/config.service';
import {Config} from '../../shared/model/config/config.model';
import {Observable} from 'rxjs';
import {QueryTermInterface} from '../../shared/model/queries/interfaces/query-term.interface';

@Component({
  selector: 'query-container',
  templateUrl: 'query-container.component.html',
  styleUrls: ['./query-container.component.css']
})

export class QueryContainerComponent {
  /** The QueryContainer this QueryContainerComponent is associated to. */
  @Input() containerModel: QueryContainerInterface;

  /** A reference to the lists of QueryContainers (to enable removing the container). */
  @Input() inList: QueryContainerInterface[];

  /**
   * Constructor; injects ConfigService
   *
   * @param {ConfigService} _configService
   */
  constructor(_configService: ConfigService) {
    this._config = _configService.asObservable();
  }

  /** A reference to the observable Config exposed by ConfigService. */
  private _config: Observable<Config>;

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

  /**
   *
   * @param type
   */
  public onToggleButtonClicked(type: QueryTermType) {
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

  private hasTermSuccessor(qt: QueryTermInterface): boolean {
    return this.containerModel.getTermIndex(qt.type) !== this.containerModel.terms.length - 1;
  }
}
