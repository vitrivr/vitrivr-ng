import * as THREE from 'three';
import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {M3DLoaderDialogComponent} from './m3d-loader-dialog.component';
import {M3DLoaderComponent} from '../../../shared/components/m3d/m3d-loader.component';
import {BinarySketchDialogComponent} from './binary-sketch-dialog.component';
import {Model3DFileLoader} from '../../../shared/util/m3d-file-loader.util';
import {first} from 'rxjs/operators';
import {M3DQueryTerm} from '../../../shared/model/queries/m3d-query-term.model';
import Mesh = THREE.Mesh;

@Component({
  selector: 'qt-m3d',
  templateUrl: 'm3d-query-term.component.html',
  styleUrls: ['m3d-query-term.component.css']
})
export class M3DQueryTermComponent implements OnInit {

  /** Value of the slider. */
  public sliderSetting: number;
  /** Slider to onToggleButtonClicked between normal image / sketch mode and 3D-sketch mode. */
  public sketch = false;
  /** Component used to display a preview of the selected 3D model. */
  @ViewChild('previewmodel')
  private preview: M3DLoaderComponent;
  /** Component used to display a preview of the sketched image (binary). */
  @ViewChild('previewimg')
  private previewimg: any;
  /** The M3DQueryTerm object associated with this M3DQueryTermComponent. That object holds all the query-settings. */
  @Input() private m3dTerm: M3DQueryTerm;

  constructor(private dialog: MatDialog, private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    if (this.m3dTerm.data) {
      this.sliderSetting = this.m3dTerm.sliderSetting;
      // TODO go from the base64-data back to what we can actually store in the previewimg
      this._snackBar.open(`Transferring 3D-Sketches or meshes between stages is currently not supported`, '', {
        duration: 5000,
      });
      this.onSliderChanged();
    }
  }

  /**
   * Triggered whenever the Mode 3D toggle is used to switch between 3D-sketch mode and normal mode.
   */
  public onModeToggled(event: Event) {
    this.sketch = !this.sketch;
    this.m3dTerm.setCategories(['lightfield']);
  }

  /**
   * This method is invoked whenever the slider value changes. Updates the feature-categories for this M3DQueryTerm based on a linear, numerical scale.
   */
  public onSliderChanged() {
    this.m3dTerm.sliderSetting = this.sliderSetting;
    switch (this.sliderSetting) {
      case 0:
        this.m3dTerm.setCategories(['sphericalharmonicslow']);
        break;
      case 1:
        this.m3dTerm.setCategories(['sphericalharmonicsdefault']);
        break;
      case 2:
        this.m3dTerm.setCategories(['sphericalharmonicshigh', 'lightfield']);
        break;
      default:
        break;
    }
  }

  /**
   * Triggered whenever the m3d-loader component is clicked by the user. Causes the
   * selection dialog to be opened.
   */
  public onModelViewerClicked() {
    this.openM3DDialog(this.preview.getMesh());
  }

  /**
   * Fired whenever something is dragged and enters the preview image.
   *
   * @param event
   */
  public onModelViewerDragEnter(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Fired whenever something is dragged over the preview image.
   *
   * @param event
   */
  public onModelViewerDragOver(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Fired whenever something is dragged and exits the preview image.
   *
   * @param event
   */
  public onModelViewerDragExit(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Handles the case in which an object is dropped over the preview-image. If the object is a file, that
   * object is treated as image and handed to the SketchDialogComponent.
   *
   * @param event Drop event
   */
  public onModelViewerDropped(event: any) {
    /* Prevent propagation. */
    event.preventDefault();
    event.stopPropagation();

    /* If the DataTransfer object of the event contains a file: apply the first one. */
    if (event.dataTransfer.files.length > 0) {
      Model3DFileLoader.loadFromFile(event.dataTransfer.files.item(0), (mesh: Mesh) => {
        this.preview.setMesh(mesh);
        this.m3dTerm.data = 'data:application/3d-json;base64,' + btoa(JSON.stringify(mesh.geometry.toJSON().data));
      });
    }
  }

  /**
   * Triggered whenever the preview image is clicked by the user. Causes the
   * sketch dialog to be opened.
   */
  public onImageViewerClicked() {
    this.openSketchDialog(this.previewimg.nativeElement.src);
  }

  /**
   * Opens the M3DLoaderDialogComponent and registers a callback that loads the saved
   * result of the dialog into preview image canvas.
   *
   * @param data Optional data that should be handed to the component.
   */
  private openM3DDialog(data?: any) {
    const dialogRef = this.dialog.open(M3DLoaderDialogComponent, {data: data});
    dialogRef.afterClosed().pipe(first()).subscribe((result: Mesh) => {
      if (result) {
        this.preview.setMesh(result);
        this.preview.render();
        this.m3dTerm.data = 'data:application/3d-json;base64,' + btoa(JSON.stringify(result.geometry.toJSON().data));
      }
    });
  }

  /**
   * Opens the M3DLoaderDialogComponent and registers a callback that loads the saved
   * result of the dialog into preview image canvas.
   */
  private openSketchDialog(data?: any) {
    const dialogRef = this.dialog.open(BinarySketchDialogComponent, {data: data});
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result) {
        this.previewimg.nativeElement.src = result;
        this.m3dTerm.data = result;
      }
    });
  }
}
