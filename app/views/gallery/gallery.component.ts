import {Component} from '@angular/core';
import {QueryService} from "../../services/queries/queries.service";
import {MediaObjectScoreContainer} from "../../types/containers";
import {Configuration} from "../../configuration/app.config";

@Component({
    selector: 'gallery',
    templateUrl: './app/views/gallery/gallery.component.html',
    styleUrls: ['app/views/gallery/gallery.component.css']
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
    constructor(public _config : Configuration, private _queryService : QueryService) {
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
        this._queryService.similarities.forEach(function(value : MediaObjectScoreContainer, key : string) {
            if (value.show()) cache.push(value)
        });
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }
        this.mediaobjects = cache;
    }
}