import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from "@angular/core";
import {AbstractResultsViewComponent} from "../abstract-results-view.component";
import {MediaObjectScoreContainer} from "../../shared/model/features/scores/media-object-score-container.model";
import {QueryService} from "../../core/queries/query.service";
import {ResolverService} from "../../core/basics/resolver.service";
import {Router} from "@angular/router";
import {SegmentScoreContainer} from "../../shared/model/features/scores/segment-score-container.model";

@Component({
    moduleId: module.id,
    selector: 'mini-gallery',
    templateUrl: 'mini-gallery.component.html',
    styleUrls: ['mini-gallery.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MiniGalleryComponent extends AbstractResultsViewComponent{
    /** List of MediaObjectScoreContainers currently displayed by the gallery. */
    protected _segments : SegmentScoreContainer[] = [];

    /** Reference to the MediaObjectScoreContainer that is currently in focus. */
    private _focus: SegmentScoreContainer;

    /**
     * Default constructor.
     *
     * @param _cdr Reference to ChangeDetectorRef used to inform component about changes.
     * @param _queryService
     * @param _resolver
     * @param _router
     */
    constructor(protected _cdr: ChangeDetectorRef, protected _queryService : QueryService, protected _resolver: ResolverService, protected _router: Router) {
        super(_cdr, _queryService);
    }


    /**
     *
     * @return {MediaObjectScoreContainer[]}
     */
    get segments(): SegmentScoreContainer[] {
        return this._segments;
    }

    /**
     *
     * @return {MediaObjectScoreContainer}
     */
    get focus(): SegmentScoreContainer {
        return this._focus;
    }

    /**
     * Sets the focus to the provided MediaObjectScoreContainer.
     *
     * @param focus'^^
     */
    set focus(value: SegmentScoreContainer) {
        this._focus = value;
    }

    /**
     * This method is used internally to update the gallery view.
     */
    protected updateView() {
        if (this._results) {
            this._segments = this._results.segments.sort((a : SegmentScoreContainer,b : SegmentScoreContainer) => SegmentScoreContainer.compareAsc(a,b));
            this._focus = null;
            if (this._segments.length > 0) this._cdr.markForCheck();
        }
    }
}