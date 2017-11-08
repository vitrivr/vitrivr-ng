import {HttpClient} from "@angular/common/http";
import {Inject} from "@angular/core";

export abstract class AbstractWebService {

    constructor (@Inject(HttpClient) private _http: HttpClient) {}
}