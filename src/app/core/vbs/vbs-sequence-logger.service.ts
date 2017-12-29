import {Injectable} from "@angular/core";

/**
 * This service can be used to log action sequences for the VBS 2018.
 */
export enum VbsAction {
    KEYWORD = "K",
    AUDIO = "A",
    OCR = "O",
    COLORSKETCH = "C",
    EDGESKETCH = "E",
    MOTIONSKETCH = "M",
    SIMILARITY = "S",
    FILTERING = "F",
    PAGING = "P",
    BROWSING = "B"
}

@Injectable()
export class VbsSequenceLoggerService {
    /** Array of VbsAction. */
    private _sequence: VbsAction[] = [];


    /**
     * Logs the specified VbsAction.
     *
     * @param {VbsAction} action
     */
    public log(action: VbsAction) {
        this._sequence.push(action);
    }

    /**
     *
     * @return {string}
     */
    public get sequence(): string {
        return this._sequence.map(v => v.toString()).join();
    }

    /**
     * Returns true, if the sequence is empty and false otherwise.
     *
     * @return {boolean}
     */
    public isEmpty(): boolean {
        return this._sequence.length == 0
    }

    /**
     * Clears the logged sequence.
     */
    public clear(): void {
        this._sequence = [];
    }
}