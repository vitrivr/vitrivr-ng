import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Config} from "./config.model";
import {Observable} from "rxjs/Observable";
import {UUIDGenerator} from "../../shared/util/uuid-generator.util";

@Injectable()
export class ConfigService {

   /** Default display duration for Snackbar messages. */
    public static SNACKBAR_DURATION = 2500;

    /** Current configuration object. */
    private _configuration: Config = new Config();

    /** A BehaviourSubject that emits Config instances. Note that the BehaviourSubject always emits the last item upon subscription. */
    private readonly subject: BehaviorSubject<Config> = new BehaviorSubject(this._configuration);

    /**
     * Default constructor.
     *
     * @param _http
     */
    constructor(private _http: Http) {
        this.reload();
    }

    /**
     * Reloads the settings file.
     */
    public reload() {
        this._http.get('config.json?r=' + UUIDGenerator.suid()).first().subscribe((result) => {
            if (result.status === 200) {
                let data = result.json();
                if (data["api"] || data["resources"] || data["evaluation"] || data["queryContainerTypes"]) {
                    this._configuration = new Config(data["api"], data["resources"], data["evaluation"], data["queryContainerTypes"]);
                    this.subject.next(this._configuration);
                }
            }
        });
    }

    /**
     * Getter for configuration.
     *
     * @return {Config}
     */
    get configuration(): Config {
        return this._configuration;
    }

    /**
     * Getter for the Observable.
     *
     * @return {Observable<T>}
     */
    get observable(): Observable<Config> {
        return this.subject.asObservable();
    }
 }
