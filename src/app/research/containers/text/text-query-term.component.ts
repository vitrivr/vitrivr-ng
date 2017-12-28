import {Component, Input} from "@angular/core";
import {TextQueryTerm} from "../../../shared/model/queries/text-query-term.model";
import {MatCheckboxChange} from "@angular/material";
@Component({
    selector: 'qt-text',
    templateUrl: 'text-query-term.component.html',
    styleUrls: ['text-query-term.component.css']
})
export class TextQueryTermComponent {


    /** The TextQueryTerm object associated with this TextQueryTermComponent. That object holds all the query settings. */
    @Input()
    private textTerm: TextQueryTerm;

    /**
     * List of tuples that designate the available categories.
     *
     * First entry designates the name of the category and the second
     * entry designates the label.
     */
    public readonly categories: [string, string][] = [
        ['ocr', 'Text on Screen'],
        ['asr', 'Subtitles'],
        ['metadata', 'Metadata'],
    ];

    /**
     *
     * @param {MatCheckboxChange} event
     */
    public onCheckboxChange(event: MatCheckboxChange) {
        if (event.checked) {
            this.textTerm.pushCategory(event.source.value)
        } else {
            this.textTerm.removeCategory(event.source.value)
        }
    }

    /**
     * Setter for the data value of textTerm (for ngModel for input field).
     *
     * @param {string} value
     */
    set inputValue(value: string) {
        this.textTerm.data = value;
    }

    /**
     * Getter for the data value of textTerm (for ngModel for input field).
     * 
     * @return {string}
     */
    get inputValue(): string {
        return this.textTerm.data;
    }
}