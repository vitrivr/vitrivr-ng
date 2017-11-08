import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
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
    constructor(private _http: HttpClient) {
        this.reload();
    }

    /**
     * Reloads the settings file.
     */
    public reload() {
        this._http.get('config.json?r=' + UUIDGenerator.suid()).first().subscribe((result: Object) => {
            if (result["api"] || result["resources"] || result["evaluation"] || result["queryContainerTypes"]  || result["vbs"]) {
                this._configuration = new Config(result["api"], result["resources"], result["evaluation"], result["queryContainerTypes"], result["vbs"]);
                this.subject.next(this._configuration);
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
