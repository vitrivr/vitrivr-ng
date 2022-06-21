import {Component, Input} from '@angular/core';
import {VbsSubmissionService} from '../../core/competition/vbs-submission.service';

@Component({
  selector: 'app-textual-submission',
  templateUrl: './textual-submission.component.html',
  styleUrls: ['./textual-submission.component.css']
})
export class TextualSubmissionComponent {

  constructor(private _submissionService: VbsSubmissionService) {
  }

  public value: string;

  @Input() smallFont = false;


  submit() {
    this._submissionService.submitText(this.value);
  }

}
