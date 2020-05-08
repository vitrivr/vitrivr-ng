import {Component, Input} from '@angular/core';
import {TextQueryTerm} from '../../../shared/model/queries/text-query-term.model';
import {MatCheckboxChange} from '@angular/material';
import {ConfigService} from '../../../core/basics/config.service';

@Component({
  selector: 'qt-text',
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
  constructor(_configService: ConfigService) {
    _configService.subscribe(c => {
      this.categories.length = 0;
      c.get<[string, string][]>('query.text.categories').forEach(v => {
        this.categories.push(v)
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
