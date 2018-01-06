import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Config} from "./config.model";
import {Observable} from "rxjs/Observable";
import {UUIDGenerator} from "../../shared/util/uuid-generator.util";
import {Configuration} from "jasmine-spec-reporter/built/configuration";

/**
 * This service provides access to the application's configuration. It extends a BehaviorSubject i.e. whenever someone subscribes
 * to the Observable exposed by ConfigService, it will receive the last known configuration. However, subsequent changes to the
 * configuration are published as well.
 */
@Injectable()
export class ConfigService extends BehaviorSubject<Config> {

   /** Default display duration for Snackbar messages. */
    public static SNACKBAR_DURATION = 2500;

    /**
     * Default constructor.
     *
     * @param _http
     */
    constructor(private _http: HttpClient) {
        super(new Config());
        this.reload();
    }

    /**
     * Reloads the settings file.
     */
    public reload() {
        this._http.get('config.json?r=' + UUIDGenerator.suid()).first().subscribe((result: Object) => {
            if (result["api"] || result["resources"] || result["evaluation"] || result["queryContainerTypes"]  || result["vbs"] || result["tags"]) {
                let configuration = new Config(result["api"], result["resources"], result["evaluation"], result["queryContainerTypes"], result["vbs"], result["tags"]);
                this.next(configuration);
            }
        });
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
