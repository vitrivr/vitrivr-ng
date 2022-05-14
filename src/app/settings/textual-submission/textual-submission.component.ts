import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {VbsSubmissionService} from '../../core/vbs/vbs-submission.service';

@Component({
  selector: 'app-textual-submission',
  templateUrl: './textual-submission.component.html',
  styleUrls: ['./textual-submission.component.css']
})
export class TextualSubmissionComponent {

  constructor(private _submissionService: VbsSubmissionService) { }

  public value: string;

  @Input() smallFont = false;


  submit(){
    this._submissionService.submitText(this.value);
  }

}
