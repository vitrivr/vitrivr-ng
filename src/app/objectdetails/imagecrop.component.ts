import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {ImageCropperComponent, CropperSettings} from 'ng2-img-cropper';
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {Http} from "@angular/http";

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

    /**
     *
     * @param src
     */
    constructor(@Inject(MD_DIALOG_DATA) private _src : string, private _ref: MdDialogRef<ImagecropComponent>, private _http: Http) {
        this._cropperSettings = new CropperSettings();
        this._cropperSettings.width = 100;
        this._cropperSettings.height = 100;
        this._cropperSettings.croppedWidth =100;
        this._cropperSettings.croppedHeight = 100;
        this._cropperSettings.canvasWidth = 400;
        this._cropperSettings.canvasHeight = 300;
        this._cropperSettings.noFileInput = true;

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
            image.src = reader.result;
            this.cropper.setImage(image);
        });
        this._http.get(this._src, {responseType: 3}).first().subscribe(data => {
            reader.readAsDataURL(data.blob());
        });
    }

    /**
     *
     */
    public onSearchClicked() {
        this._ref.close(this._data.image);
    }


    get data(): any {
        return this._data;
    }

    get cropperSettings(): CropperSettings {
        return this._cropperSettings;
    }
}