import {Component} from '@angular/core';

@Component({
  selector: 'pose-discard-confirm',
  template: `
    <h2 mat-dialog-title>Discard query?</h2>
    <mat-dialog-content>
      <p>
          You have specified a pose, but have not selected a pose model
          and therefore have not specified a valid pose query.
      </p>
      <p>
          Discard your query, or return and fully specify a valid pose query?
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button color="accent" mat-button mat-dialog-close>
        Cancel
      </button>
      <button color="warn" mat-button [mat-dialog-close]="true">
        Discard query
      </button>
    </mat-dialog-actions>`
})

export class PoseDiscardConfirmComponent {}
