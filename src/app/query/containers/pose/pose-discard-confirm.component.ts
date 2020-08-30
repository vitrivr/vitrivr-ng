import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'pose-discard-confirm',
  template: `
    <h2 mat-dialog-title>Discard query?</h2>
    <mat-dialog-content>
      <p>
          {{ data.message }}
      </p>
      <p>
          If you close this dialog now, your image and poses will be discarded.
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button color="accent" mat-button mat-dialog-close>
        Go back
      </button>
      <button color="warn" mat-button [mat-dialog-close]="true">
        Close &amp; discard
      </button>
    </mat-dialog-actions>`
})

export class PoseDiscardConfirmComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
}
