import {Injectable} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class PreviousRouteService {

    private previousUrl: string;
    private currentUrl: string;

    constructor(private _router: Router) {
        this._router.events
            .pipe(filter(event => event instanceof NavigationEnd))
            .subscribe(({urlAfterRedirects}: NavigationEnd) => {
                console.log('router navigated from ' + this.currentUrl + ' to ' + urlAfterRedirects);
                this.previousUrl = this.currentUrl;
                this.currentUrl = urlAfterRedirects;
            });
    }

    public getPreviousRoute() {
        return this.previousUrl;
    }

    public goToPrevious() {
        console.log('navigating to previous location: ' + this.getPreviousRoute());
        this._router.navigate([this.getPreviousRoute()], {skipLocationChange: true})
    }
}
