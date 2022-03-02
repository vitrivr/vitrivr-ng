import {Component, Input, OnInit, ViewChild} from "@angular/core";
import {PoseQueryTerm} from "../../../shared/model/queries/pose-query-term.model";
import {first} from "rxjs/operators";
import {PoseQuery} from "./pose-query.interface";
import {MatDialog} from "@angular/material/dialog";
import {ResolverService} from "../../../core/basics/resolver.service";
import {HttpClient} from "@angular/common/http";
import {PoseSketchDialogComponent} from "./pose-sketch-dialog.component";

@Component({
  selector: 'app-qt-pose',
  templateUrl: 'pose-query-term.component.html',
  styleUrls: ['pose-query-term.component.scss']
})
export class PoseQueryTermComponent implements OnInit {

  /** Component used to display a preview of the pose query. */
  @ViewChild('previewimg', {static: true})
  private previewimg: any;

  /** The {@link PoseQueryTerm} object associated with this {@link PoseQueryTermComponent}. That object holds all the query-settings. */
  @Input()
  private poseTerm: PoseQueryTerm;

  /** The {@link PoseQuery} object associated with this {@link PoseQueryTermComponent}. */
  @Input()
  private poseQuery: PoseQuery;


  constructor(private _dialog: MatDialog, private _resolver: ResolverService, private _http: HttpClient) {
  }

  ngOnInit(): void {

  }

  /**
   * Triggered whenever someone click on the image, which indicates that
   * it should be edited; opens the SketchDialogComponent
   */
  public onViewerClicked() {
    this.openSketchDialog(this.poseQuery);
  }

  /**
   * Opens the {@link PoseSketchDialogComponent} and registers a callback that loads the saved result
   * of the dialog into preview image canvas.
   *
   * @param data Optional data that should be handed to the component.
   */
  private openSketchDialog(data?: PoseQuery) {
    /* Initialize the correct dialog-component. */
    const dialogRef = this._dialog.open(PoseSketchDialogComponent, {data: data, width: '750px', height: '690px'});
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      this.poseQuery = result
      this.redraw()
    });
  }

  /**
   * Redraws the preview image.
   */
  private redraw() {

  }
}
