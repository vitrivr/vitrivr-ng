import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from '../../shared/model/config/config.model';
import {UUIDGenerator} from '../../shared/util/uuid-generator.util';
import {first, map} from 'rxjs/operators';

/**
 * This service provides access to the application's configuration. It extends a BehaviorSubject i.e. whenever someone subscribes
 * to the Observable exposed by ConfigService, it will receive the last known configuration. However, subsequent changes to the
 * configuration are published as well.
 */
@Injectable()
export class ConfigService extends BehaviorSubject<Config> {

    constructor(private _http: HttpClient) {
        super(new Config());
        this.reset();
    }

    /**
     * Reloads config from server
     */
    public reset() {
        this.loadFromServer().subscribe(c => this.next(c));
    }

    /**
     * Loads the configuration from the server (config.json) and returns the parsed version as Observable.
     *
     * @return {Observable<Config>}
     */
    private loadFromServer(): Observable<Config> {
        return this._http.get('config.json?r=' + UUIDGenerator.suid()).pipe(
            map((r: Object) => {
                if (r) {
                    return Config.deserialize(r)
                } else {
                    return null;
                }
            }),
            first()
        );
    }
}
