import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {SketchDialogComponent} from './sketch-dialog.component';
import {MatDialog} from '@angular/material';
import {ImageQueryTerm} from '../../../shared/model/queries/image-query-term.model';
import {ResolverService} from '../../../core/basics/resolver.service';
import {HttpClient} from '@angular/common/http';
import {MediaSegmentDragContainer} from '../../../shared/model/internal/media-segment-drag-container.model';
import {first} from 'rxjs/operators';

@Component({
  selector: 'qt-image',
  templateUrl: 'image-query-term.component.html',
  styleUrls: ['image-query-term.component.css']
})
export class ImageQueryTermComponent implements OnInit {

  /** Slider to adjust the query-term settings; i.e. to select the refinement used for image-queries. */
  public sliderSetting: number = 1;
  /** Component used to display a preview of the selected AND/OR sketched image. */
  @ViewChild('previewimg')
  private previewimg: any;
  /** The ImageQueryTerm object associated with this ImageQueryTermComponent. That object holds all the settings. */
  @Input()
  private imageTerm: ImageQueryTerm;

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
   * Update settings based on preset.
   */
  ngOnInit(): void {
    this.onSettingsChanged(null);
  }

  /**
   * Triggered whenever either the slider for the category settings is used. Adjusts the feature categories
   * in the ImageQueryTerm on a linear, numerical scale.
   *
   * @param event
   */
  public onSettingsChanged(event: any) {
    // FIXME there are debates about the usefulness of this slider...
    switch (this.sliderSetting) {
      case 0:
        this.imageTerm.setCategories(['globalcolor', 'localcolor']);
        break;
      case 1:
        this.imageTerm.setCategories(['globalcolor', 'localcolor', 'quantized']);
        break;
      case 2:
        this.imageTerm.setCategories(['globalcolor', 'localcolor', 'quantized', 'edge']);
        break;
      case 3:
        this.imageTerm.setCategories(['quantized', 'localcolor', 'localfeatures', 'edge']);
        break;
      case 4:
        this.imageTerm.setCategories(['localcolor', 'localfeatures', 'edge']);
        break;
      default:
        this.imageTerm.setCategories(['globalcolor', 'localcolor', 'quantized']);
        break;
    }
  }

  /**
   * Triggered whenever someone click on the image, which indicates that
   * it should be edited; opens the SketchDialogComponent
   */
  public onViewerClicked() {
    this.openSketchDialog(this.previewimg.nativeElement.src);
  }

  /**
   * Fired whenever something is dragged and enters the preview image.
   *
   * @param event
   */
  public onViewerDragEnter(event: any) {
    event.preventDefault();
    event.target.classList.add('ondrag');
  }

  /**
   * Fired whenever something is dragged over the preview image.
   *
   * @param event
   */
  public onViewerDragOver(event: any) {
    event.preventDefault();
  }

  /**
   * Fired whenever something is dragged and exits the preview image.
   *
   * @param event
   */
  public onViewerDragExit(event: any) {
    event.preventDefault();
    event.target.classList.remove('ondrag');
  }

  /**
   * Handles the case in which an object is dropped over the preview-image. If the object is a file, that
   * object is treated as image and handed to the SketchDialogComponent.
   *
   * @param event Drop event
   */
  public onViewerDropped(event: any) {
    /* Prevent propagation. */
    event.preventDefault();
    event.stopPropagation();

    /* Remove the ondrag class (change of border-style). */
    event.target.classList.remove('ondrag');

    /* Prepare file reader (just in case). */
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.applyImageData(<string>reader.result);
    });

    /**
     * Handle dropped object... cases
     */
    if (event.dataTransfer.files.length > 0) {
      /* Case 1: Object is a file. */
      reader.readAsDataURL(event.dataTransfer.files.item(0));
    } else if (event.dataTransfer.getData('application/vitrivr-mediasegment')) {
      /* Case 2: Object is of type 'application/vitrivr-mediasegment' - use its thumbnail as image. */
      let drag: MediaSegmentDragContainer = MediaSegmentDragContainer.fromJSON(event.dataTransfer.getData(MediaSegmentDragContainer.FORMAT));
      let url = this._resolver.pathToThumbnail(drag.object, drag.segment);
      this._http.get(url, {responseType: 'blob'}).pipe(first()).subscribe(data => {
        reader.readAsDataURL(data);
      });
    }
  }

  /**
   * Applies image data and updates the ImageQueryTerm's data attribute as well as
   * the preview image.
   *
   * @param data Data that should be added (must be base64 encoded).
   */
  private applyImageData(data: string) {
    this.previewimg.nativeElement.src = data;
    this.imageTerm.data = data;
  }

  /**
   * Opens the SketchDialogComponent and registers a callback that loads the saved
   * result of the dialog into preview image canvas.
   *
   * @param data Optional data that should be handed to the component.
   */
  private openSketchDialog(data?: any) {
    /* Initialize the correct dialog-component. */
    let dialogRef = this._dialog.open(SketchDialogComponent, {data: data, width: '750px', height: '690px'});
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result) {
        this.applyImageData(result);
      }
    });
  }
}
