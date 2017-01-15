import { Component } from '@angular/core';
import {QueryService} from "../../services/queries/queries.service";
import {Observer} from "rxjs";
import {MediaObjectScoreContainer} from "../../types/containers";
import {Configuration} from "../../configuration/app.config";

@Component({
    selector: 'gallery',
    templateUrl: './app/views/gallery/gallery.component.html'
})


export class GalleryComponent implements Observer<any> {


    private subscription : any;

    /**
     *
     */
    private mediaobjects : MediaObjectScoreContainer[];

    constructor(private _config : Configuration, private _queryService: QueryService) {}

    /**
     *
     */
    ngOnInit(): void {
        this.subscription = this._queryService.observable.subscribe(this);
        console.log("Subscribed.");
    }

    /**
     *
     */
    public update() {
        let cache : MediaObjectScoreContainer[] = [];
        this._queryService.similarities.forEach(function(value : MediaObjectScoreContainer, key : string) {
            if (value.show()) cache.push(value)
        });
        if (cache.length > 1) {
            cache.sort((a : MediaObjectScoreContainer,b : MediaObjectScoreContainer) => MediaObjectScoreContainer.compareAsc(a,b))
        }
        this.mediaobjects = cache;
    }

    /**
     *
     * @param value
     */
    public next(value: any) {
        this.update()
    }

    error: (err: any) => {

    };

    complete: () => {

    };

}