import {Component} from '@angular/core';
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {QueryService} from "../core/queries/query.service";
import {ConfigService} from "../core/basics/config.service";
import {Router} from "@angular/router";
import {MediaObject} from "../shared/model/media/media-object.model";
import {ResolverService} from "../core/basics/resolver.service";

@Component({
    moduleId: module.id,
    selector: 'gallery',
    templateUrl: 'gallery.component.html',
    styleUrls: ['gallery.component.css']
})


export class GalleryComponent {
    /** */
    public mediaobjects : MediaObjectScoreContainer[];

    /**
     * Default constructor.
     *
     * @param _queryService
     * @param _resolver
     * @param _router
     */
    constructor(private _queryService : QueryService, private _resolver: ResolverService, private _router: Router) {
        _queryService.observable()
            .filter(msg => (msg == "UPDATED"))
            .subscribe((msg) => this.onQueryStateChange());

        if (_queryService.size() > 0) {
            this.updateGallery();
        }
    }

    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     */
    private onQueryStateChange() {
        this.updateGallery();
    }

    /**
     *
     * @param object
     */
    private onTileClicked(object: MediaObject) {
        this._router.navigate(['/mediaobject/' + object.objectId]);
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