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
    this.currentUrl = '/';
    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(({urlAfterRedirects}: NavigationEnd) => {
        console.debug(`navigating to ${urlAfterRedirects} from ${this.currentUrl}`);
        this.previousUrl = this.currentUrl;
        this.currentUrl = urlAfterRedirects;
      });
  }

  public getPreviousRoute() {
    return this.previousUrl;
  }

  public goToRoot() {
    console.debug(`navigating to root`)
    this._router.navigate(['/'])
  }

  public goToPrevious() {
    console.debug(`navigating to previous location: ${this.getPreviousRoute()}`);
    this._router.navigate([this.getPreviousRoute()], {skipLocationChange: true})
  }
}
