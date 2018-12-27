import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, combineLatest} from "rxjs";
import {Config} from "../../shared/model/config/config.model";
import {Observable} from "rxjs";
import {UUIDGenerator} from "../../shared/util/uuid-generator.util";
import {fromPromise} from "rxjs/internal-compatibility";
import {first, flatMap, map, tap} from "rxjs/operators";
import {DatabaseService} from "./database.service";

import Dexie from "dexie";

/**
 * This service provides access to the application's configuration. It extends a BehaviorSubject i.e. whenever someone subscribes
 * to the Observable exposed by ConfigService, it will receive the last known configuration. However, subsequent changes to the
 * configuration are published as well.
 */
@Injectable()
export class ConfigService extends BehaviorSubject<Config> {
    /** The table used to store Vitrivr NG configuration.*/
    private _configTable: Dexie.Table<any, string>;

    /**
     * Default constructor.
     *
     * @param _http
     * @param _db
     */
    constructor(private _http: HttpClient, _db: DatabaseService) {
        super(new Config());
        this._configTable = _db.db.table('config');
        this.reload();
    }

    /**
     * Reloads the Config from the database and the settings file. If a db version exists, that version is preferred.
     */
    public reload() {
        combineLatest(
            this.loadFromDatabase(),
            this.loadFromServer()
        ).pipe(
            map(([c1, c2]) =>{
                return (c1 ? c1 : c2)
            }),
            tap(c => {
                return this.saveToDatabase(c)
            }),
            first()
        ).subscribe(c => this.next(c));
    }

    /**
     * Resets the Config in the database and reloads it from the server.
     */
    public reset() {
        fromPromise(this._configTable.delete(Config.DB_KEY)).pipe(
            flatMap(() => this.loadFromServer()),
            tap(c => {
                return this.saveToDatabase(c)
            }),
            first()
        ).subscribe(c => this.next(c));
    }

    /**
     * Applies the provded config object by saving it to the database and using it as the actual config file.
     *
     * @param {Config} config
     */
    public apply(config: Config) {
        fromPromise(this._configTable.put(config,Config.DB_KEY)).subscribe(c => this.next(config))
    }

    /**
     * Loads the configuration from the local database and returns the parsed version as Observable.
     *
     * @return {Observable<Config>}
     */
    private loadFromDatabase(): Observable<Config> {
        return fromPromise(this._configTable.get(Config.DB_KEY)).pipe(
            map((r: Object) => {
                if (r["_config"]) {
                    return Config.deserialize(r["_config"])
                } else {
                    return null;
                }
            }),
            first()
        );
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

    /**
     * Saves the provided configuration object to the IndexedDB database using Dexie.
     *
     * @param {Config} config The configuration object that should be saved.
     */
    private saveToDatabase(config: Config) {
        return fromPromise(this._configTable.put(config,Config.DB_KEY)).pipe(first()).subscribe();
    }

    /**
     * Getter for the Observable.
     *
     * @return {Observable<T>}
     * @deprecated
     */
    get observable(): Observable<Config> {
        return this.asObservable();
    }
 }
