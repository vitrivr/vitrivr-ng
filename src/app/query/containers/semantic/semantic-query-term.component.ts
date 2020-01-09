import {Component, Input, ViewChild} from '@angular/core';
import {MatDialog, MatDialogConfig} from '@angular/material';
import {ResolverService} from '../../../core/basics/resolver.service';
import {HttpClient} from '@angular/common/http';
import {first} from 'rxjs/operators';
import {SemanticSketchDialogComponent} from './semantic-sketch-dialog.component';
import {SemanticQueryTerm} from '../../../shared/model/queries/semantic/semantic-query-term.model';
import {SemanticMap} from '../../../shared/model/queries/semantic/semantic-map.model';

@Component({
  selector: 'qt-semantic',
  templateUrl: 'semantic-query-term.component.html',
  styleUrls: ['semantic-query-term.component.css']
})
export class SemanticQueryTermComponent {

  /** Component used to display a preview of the selected AND/OR sketched image. */
  @ViewChild('previewimg')
  private previewimg: any;

  /** The SemanticQueryTerm object associated with this SemanticQueryTermComponent. That object holds all the query-settings. */
  @Input()
  private semanticTerm: SemanticQueryTerm;

  /**
   * Default constructor.
   *
   * @param _dialog
   * @param _resolver
   * @param _http
   */
  constructor(private _dialog: MatDialog, private _resolver: ResolverService, private _http: HttpClient) {
  }

  /**
   * Triggered whenever someone click on the image, which indicates that
   * it should be edited; opens the SketchDialogComponent
   */
  public onViewerClicked() {
    if (this.semanticTerm.data && this.semanticTerm.map.length > 0) {
      this.openSketchDialog(new SemanticMap(this.semanticTerm.image, this.semanticTerm.map));
    } else {
      this.openSketchDialog();
    }
  }

  /**
   * Opens the SketchDialogComponent and registers a callback that loads the saved
   * result of the dialog into preview image canvas.
   *
   * @param data Optional data that should be handed to the component.
   */
  private openSketchDialog(data?: SemanticMap) {
    /* Prepare config & initialize the correct dialog-component. */
    let config = new MatDialogConfig<SemanticMap>();
    config.height = '450px';
    config.data = data;

    let dialogRef = this._dialog.open(SemanticSketchDialogComponent, config);

    /* Register the onClose callback. */
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result instanceof SemanticMap) {
        this.semanticTerm.image = result.image;
        this.semanticTerm.map = result.map;
        this.previewimg.nativeElement.src = result.image;
      }
    });
  }
}
