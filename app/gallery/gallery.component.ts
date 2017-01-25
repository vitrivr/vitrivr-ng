import {Component} from '@angular/core';
import {MediaObjectScoreContainer} from "../core/queries/media-object-score-container.model";
import {QueryService} from "../core/queries/queries.service";
import {ConfigService} from "../core/config.service";

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
     * @param _api Reference to the CineastAPI. Gets injected by DI.
     * @param _config
     * @param _queryService
     */
    constructor(private _queryService : QueryService, private _config: ConfigService) {
        _queryService.observable()
            .filter(msg => (msg == "UPDATED"))
            .subscribe((msg) => this.onQueryStateChange());
    }

    /**
     * Invoked whenever the QueryService reports that the results were updated. Causes
     * the gallery to be re-rendered.
     */
    public onQueryStateChange() {
        let cache : MediaObjectScoreContainer[] = [];
        this._queryService.results.forEach(function(value : MediaObjectScoreContainer, key : string) {
            if (value.show()) cache.push(value)
        });
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }
        this.mediaobjects = cache;
    }
}