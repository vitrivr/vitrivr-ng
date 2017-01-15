import {Http, Response} from "@angular/http";
import {Configuration} from "../configuration/app.config";
import {Observable} from 'rxjs/Rx';
import {Injectable} from "@angular/core";

export interface ServiceInterface {
    _http: Http;
    _configuration: Configuration;
    url(path : string) : string;
}

@Injectable()
export abstract class AbstractService implements ServiceInterface {
    _http : Http;
    _configuration: Configuration;

    constructor (_http: Http, _configuration: Configuration) {
        this._http = _http;
        this._configuration = _configuration;
    }

    public url(path: String) : string {
        return this._configuration.endpoint_http + path;
    }

    protected handleError (error: Response | any) {
        // In a real world app, we might use a remote logging infrastructure
        let errMsg: string;
        if (error instanceof Response) {
            const body = error.json() || '';
            const err = body.error || JSON.stringify(body);
            errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
        } else {
            errMsg = error.message ? error.message : error.toString();
        }
        console.error(errMsg);
        return Observable.throw(errMsg);
    }
}