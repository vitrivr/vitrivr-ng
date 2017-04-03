import {EvaluationEvent} from "./evaluation-event";
export class Evaluation {

    /** Date/time of the begin of the current evaluation. */
    private begin: Date;

    /** Date/time of the end of the current evaluation. */
    private end: Date;

    /** State indicator; true if evaluation is running and false otherwise. */
    private running: boolean = false;

    /** List of evaluation events. */
    private events: EvaluationEvent[] = [];

    /**
     *
     * @param name
     * @param start
     */
    constructor(private name : string) {}

    /**
     * Starts the evaluation. Sets the start timestamp and changes
     * the state to running.
     */
    public start() {
        if (!this.running) {
            this.running = true;
            this.begin = new Date();
        }
    }

    /**
     * Stops the evaluation. Sets the stops timestamp and changes
     * the state to stopped.
     */
    public stop() {
        if (this.running) {
            this.running = false;
            this.end = new Date();
        }
    }

    /**
     *
     */
    public isRunning(): boolean {
        return this.running;
    }

    /**
     * Creates a JSON representation of the Evaluation-Object and downloads that
     * representation.
     */
    public download() {
        let json = JSON.stringify(this);
        if (json.length > 0) {
            let blob = new Blob([json], {type: 'application/json'});
            let url = window.URL.createObjectURL(blob);
            window.open(url);
        }
    }

    /**
     * Adds a new evaluation-event to the list of evaluation events.
     *
     * @param event EvaluationEvent to be added.
     */
    public addEvent(event: EvaluationEvent) {
        if (this.running) {
            this.events.push(event);
        }
    }
}