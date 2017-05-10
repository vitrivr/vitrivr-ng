import {EvaluationSet} from "../../shared/model/evaluation/evaluation-set";
import {Inject, Injectable} from "@angular/core";
import {StorageService} from "../basics/storage.service";
import {Http} from "@angular/http";
import {EvaluationTemplate} from "../../shared/model/evaluation/evaluation-template";
import {Observable} from "rxjs/Observable";

@Injectable()
export class EvaluationService {
    /** Storage key used to persistently store evaluation data. */
    public static EVALUATION_STORAGE_KEY = "vitrivr_ng_evaluation";

    /**
     * Default constructor.
     */
    constructor(@Inject(StorageService) private _storage : StorageService, private _http: Http) {}

    /**
     * Saves the current state of the Evaluation in the local store.
     */
    public saveEvaluation(evaluationset: EvaluationSet): boolean {
        /** Reads the objects from the store OR creates a new one. */
        let object = {};
        if (this._storage.has(EvaluationService.EVALUATION_STORAGE_KEY)) {
            object = this._storage.readObjectForKey(EvaluationService.EVALUATION_STORAGE_KEY)
        }
        object[evaluationset.id] = EvaluationSet.serialise(evaluationset);
        return this._storage.writeObjectForKey(EvaluationService.EVALUATION_STORAGE_KEY, object);
    }

    /**
     * Tries to load an evaluation for the provided participant. On succes, the method returns the
     * loaded EvaluationSet. If loading the evaluation set for the participant fails, the evaluation set
     *
     * @param participant
     * @return {any}
     */
    public loadEvaluation(participant: string): EvaluationSet {
        /* Check if the Evaluation Storage entry exists at all. If not, return null. */
        if (!this._storage.has(EvaluationService.EVALUATION_STORAGE_KEY)) return null;
        let object = this._storage.readObjectForKey(EvaluationService.EVALUATION_STORAGE_KEY);

        /* Check if there is an entry for the participant. If not, return null. */
        if (!object[participant]) return null;

        return EvaluationSet.deserialise(object[participant]);
    }

    /**
     * Prepares and returns a Blob with all the evaluation data.
     *
     * @param participant
     * @return {any}
     */
    public evaluationData(): Blob {
        let data = this._storage.readPrimitiveForKey(EvaluationService.EVALUATION_STORAGE_KEY);
        let blob = new Blob([data, {type: "application/json"}]);
        return blob;
    }

    /**
     * Clears all the evaluation data.
     */
    public clear() {
        this._storage.remove(EvaluationService.EVALUATION_STORAGE_KEY);
    }

    /**
     * Tries to load an EvaluationTemplate from the provided URL and returns that template as
     * Observable.
     *
     * @param url URL to load the template from.
     */
    public loadEvaluationTemplate(url: string): Observable<EvaluationTemplate> {
        return this._http.get(url).map((response) => {
            if (response.ok) {
                return EvaluationTemplate.fromJson(response.json(), response.url);
            } else {
                throw new Error("Could not load the EvaluationTemplate from the provided URL.");
            }
        });
    }
}