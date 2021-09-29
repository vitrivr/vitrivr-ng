import {Component, Input, QueryList, ViewChildren} from '@angular/core';
import {QueryContainerInterface} from '../../shared/model/queries/interfaces/query-container.interface';
import {Config} from '../../shared/model/config/config.model';
import {Observable} from 'rxjs';
import {TemporalDistanceComponent} from '../temporal-distance/temporal-distance.component';
import {AppConfig} from '../../app.config';
import {QueryTerm} from '../../../../openapi/cineast';
import {TemporalMode} from '../../settings/preferences/temporal-mode-container.model';

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

  /** A reference to the temporal mode (To transfer information from it to the other containers) */
  @Input() mode: TemporalMode;

  /** Temporal Distance components to retrieve the temporal distance input provided by the user */
  @ViewChildren(TemporalDistanceComponent) temporalDistances: QueryList<TemporalDistanceComponent>;

  _config: Config

  queryOptionsImage = ((c: Config) => c._config.query.options.image)
  queryOptionsAudio = ((c: Config) => c._config.query.options.audio)
  queryOptions3D = ((c: Config) => c._config.query.options.model3d)
  queryOptionsMotion = ((c: Config) => c._config.query.options.motion)
  queryOptionsText = ((c: Config) => c._config.query.options.text)
  queryOptionsTag = ((c: Config) => c._config.query.options.tag)
  queryOptionsSemantic = ((c: Config) => c._config.query.options.semantic)
  queryOptionsBoolean = ((c: Config) => c._config.query.options.boolean)




  /**
   * Constructor; injects ConfigService
   *
   * @param {AppConfig} _configService
   */
  constructor(_configService: AppConfig) {
    _configService.configAsObservable.subscribe(c => this._config = c)
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
    if (this.isNotFirst) {
      const index = this.index;
      const container = this.inList[index - 1];
      this.inList[index - 1] = this.containerModel;
      this.inList[index] = container;
    }
  }

  public moveQueryContainerDown() {
    if (this.isNotLast) {
      const index = this.index;
      const container = this.inList[index + 1];
      this.inList[index + 1] = this.containerModel;
      this.inList[index] = container;
    }
  }

  /** Change the temporal mode to the one selected */
  public changeMode(mode: TemporalMode) {
    this.mode = mode;
  }

  /** Tests whether or not to display distance to previous container */
  get isTimeDistance(): boolean {
    return this.mode === 'TEMPORAL_DISTANCE' && this.isNotFirst;
  }
}
