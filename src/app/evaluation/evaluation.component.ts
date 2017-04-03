import {Component} from "@angular/core";
import {QueryService, QueryChange} from "../core/queries/query.service";
import {Evaluation} from "./evaluation";
import {EvaluationEvent} from "./evaluation-event";
import {ResolverService} from "../core/basics/resolver.service";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";


@Component({
    moduleId: module.id,
    selector: 'evaluation',
    templateUrl: 'evaluation.component.html'
})


export class EvaluationComponent {
    /** */
    private nameFieldValue: string = "";

    /** */
    private evaluation: Evaluation;

    /** */
    public mediaobjects : MediaObjectScoreContainer[];

    /**
     * Constructor; injects the QueryService for evaulation.
     * @param _queryService
     * @param _resolverService
     * */
    constructor(private _queryService : QueryService, private _resolverService: ResolverService) {
        _queryService.observable()
            .filter(msg => (["UPDATED", "STARTED", "ENDED", "FEATURE"].indexOf(msg) > -1))
            .subscribe((msg) => this.processQueryStateChange(msg));
    }

    /**
     *
     */
    private onEvaluationButtonClick() {
        if (!this.evaluation) {
            this.evaluation = new Evaluation(this.nameFieldValue);
            this.evaluation.start();
        } else if (this.evaluation.isRunning()) {
            this.evaluation.stop();
        }
    }

    /**
     *
     */
    private onExportButtonClick() {
        if (this.evaluation && !this.evaluation.isRunning()) {
            this.evaluation.download();
        }
    }

    /**
     *
     * @param msg
     */
    private processQueryStateChange(msg: QueryChange) {
        if (this.evaluation && this.evaluation.isRunning()) {
            let event = null;
            switch (msg) {
                case "STARTED":
                    event = new EvaluationEvent(new Date(), "STARTED", this._queryService.getQueryId(), null);
                    break;
                case "FEATURE":
                    event = new EvaluationEvent(new Date(), "FEATURE_AVAILABLE", this._queryService.getQueryId(), this._queryService.getFeatures()[this._queryService.getFeatures().length-1].readableName);
                    break;
                case "ENDED":
                    event = new EvaluationEvent(new Date(), "ENDED", this._queryService.getQueryId(), null);
                    break;
                case "UPDATED":
                    this.updateGallery();
                    break;
            }
            if (event) this.evaluation.addEvent(event);
        }
    }

    /**
     *
     */
    private updateGallery() {
        let cache : MediaObjectScoreContainer[] = [];
        this._queryService.forEach(function(value : MediaObjectScoreContainer, key : string) {
            if (value.show()) cache.push(value)
        });
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }
        this.mediaobjects = cache;
    }
}