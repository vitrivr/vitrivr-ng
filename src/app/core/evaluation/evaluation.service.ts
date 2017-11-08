import {EvaluationSet} from "../../shared/model/evaluation/evaluation-set";
import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {EvaluationTemplate} from "../../shared/model/evaluation/evaluation-template";
import {Observable} from "rxjs/Observable";
import Dexie from 'dexie';
import * as JSZip from 'jszip';

@Injectable()
export class EvaluationService extends Dexie {
    /** Table used to store evaluation data. */
    private evaluations: Dexie.Table<any, string>;

    /**
     * Default constructor.
     */
    constructor(private _http: HttpClient) {
        super("vitrivng");
        this.version(1).stores({
            evaluations: 'id,name,template,evaluations,position'
        });
    }

    /**
     * Saves the current state of the Evaluation in the local store.
     */
    public saveEvaluation(evaluationset: EvaluationSet): Observable<string> {
        /** Reads the objects from the store OR creates a new one. */
        return Observable.fromPromise(this.evaluations.put(EvaluationSet.serialise(evaluationset)));
    }

    /**
     * Tries to load an evaluation for the provided participant. On succes, the method returns the
     * loaded EvaluationSet. If loading the evaluation set for the participant fails, the evaluation set
     *
     * @param participantId
     * @return {any}
     */
    public loadEvaluation(participantId: string): Observable<EvaluationSet> {
        /* Check if the Evaluation Storage entry exists at all. If not, return null. */
        return Observable.fromPromise(this.evaluations.get(participantId)).map((result) => {
            if (result) {
                return EvaluationSet.deserialise(result);
            } else {
                Observable.throw(new Error("Could not find an the evaluation for participant '" + participantId + "'."));
            }
        });
    }

    /**
     * Prepares and returns a Blob with all the evaluation data.
     *
     * @param participant
     * @return {any}
     */
    public evaluationData(): Observable<JSZip> {
        return Observable.fromPromise(this.evaluations.toArray()).map((results: any[]) => {
            let zip = new JSZip();
            let options = {base64: false, binary: false, date: new Date(), createFolders: false, dir: false,};
            for (let result of results) {
                zip.file(result["id"] + ".json", JSON.stringify(result, null, 2), options)
            }
            return zip
        });
    }

    /**
     * Clears all the evaluation data.
     */
    public clear() : Promise<void> {
        return this.evaluations.clear()
    }

    /**
     * Tries to load an EvaluationTemplate from the provided URL and returns that template as
     * Observable.
     *
     * @param url URL to load the template from.
     */
    public loadEvaluationTemplate(url: string): Observable<EvaluationTemplate> {
        return this._http.get(url, {observe: 'response'}).map(
            response => {
                if (response.ok) {
                    return EvaluationTemplate.fromJson(response.body, response.url);
                } else {
                    Observable.throw(new Error("Could not load the EvaluationTemplate due to a HTTP error (Status: " + response.status + ")"));
                }
            }
        );
    }
}