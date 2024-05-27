import {Component, Input} from '@angular/core';
import {TextQueryTerm} from '../../../shared/model/queries/text-query-term.model';
import {MatCheckboxChange} from '@angular/material/checkbox';
import {AppConfig} from '../../../app.config';

@Component({
  selector: 'app-qt-text',
  templateUrl: 'text-query-term.component.html',
  styleUrls: ['text-query-term.component.css']
})
export class TextQueryTermComponent {

  /**
   * List of tuples that designate the available categories.
   *
   * First entry designates the name of the category and the second
   * entry designates the label.
   */
  public readonly categories: [string, string][] = [];
  /** The TextQueryTerm object associated with this TextQueryTermComponent. That object holds all the query settings. */
  @Input()
  private textTerm: TextQueryTerm;

  /**
   * Constructor for TextQueryTerm
   *
   * @param _configService
   */
  constructor(_configService: AppConfig) {
    _configService.configAsObservable.subscribe(c => {
      this.categories.length = 0;
      c._config.query.text.categories.forEach(v => {
        this.categories.push([v[0], v[1]]);
      })
    })
  }

  /**
   * Getter for the data value of textTerm (for ngModel for input field).
   *
   * @return {string}
   */
  get inputValue(): string {
    return this.textTerm.data;
  }

  /**
   * Setter for the data value of textTerm (for ngModel for input field).
   *
   * @param {string} value
   */
  set inputValue(value: string) {
    this.textTerm.data = value;
    if (value.trim().length > 0) { //enable
      this.textTerm.enable();
    } else {
      this.textTerm.disable();
    }
  }

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

  isChecked(category: [string, string]) {
    return this.textTerm.categories.indexOf(category[0]) > -1;
  }
}
