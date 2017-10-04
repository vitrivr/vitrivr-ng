import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {Http} from "@angular/http";
import {QueryService} from "../core/queries/query.service";
import {MaterialModule} from "../material.module";

@Component({
    moduleId: module.id,
    selector: 'imagecrop-dialog',
    templateUrl: 'imagecrop.component.html'
})
export class ImagecropComponent implements OnInit {



    private _data: any;
    private _cropperSettings: CropperSettings;

    @ViewChild("cropper")
    private cropper: ImageCropperComponent;

    public isLoaded: boolean = false;

    /**
     *
     * @param src
     */
    constructor(@Inject(MD_DIALOG_DATA) private _src : string, private _ref: MdDialogRef<ImagecropComponent>, private _http: Http, private _query : QueryService) {
        this._cropperSettings = new CropperSettings();

        this._cropperSettings.canvasWidth = 800;
        this._cropperSettings.canvasHeight = 600;
        this._cropperSettings.noFileInput = true;
        this._cropperSettings.preserveSize = true;
        this._cropperSettings.keepAspect = false;

        this._cropperSettings.minWithRelativeToResolution = false;
        this._cropperSettings.minWidth = 25;
        this._cropperSettings.minHeight = 25;

        this._data = {

        };
    }

    /**
     * Lifecycle hook (onInit): Loads the image and converts it to a data URL.
     */
    public ngOnInit(): void {
        let reader = new FileReader();
        reader.addEventListener("load", () => {
            let image = new Image();

            image.onload = () => {
              this.cropper.setImage(image);
              this.isLoaded = true;
            };

            image.src = reader.result;
        });
        this._http.get(this._src, {responseType: 3}).first().subscribe(data => {
            reader.readAsDataURL(data.blob());
        });
    }

    /**
     *
     */
    public onSearchClicked() {
        this._query.findByDataUrl(this._data.image);
        this._ref.close(this._data.image);
    }


    get data(): any {
        return this._data;
    }

    get cropperSettings(): CropperSettings {
        return this._cropperSettings;
    }
}
