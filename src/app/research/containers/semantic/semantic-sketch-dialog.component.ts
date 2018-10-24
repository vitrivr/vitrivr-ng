import {Component, ViewChild, OnInit, Inject, AfterViewInit, Optional} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {SketchCanvas} from "../../../shared/components/sketch/sketch-canvas.component";
import {SemanticCategory} from "../../../shared/model/queries/semantic/semantic-category.model";
import {SemanticMap} from "../../../shared/model/queries/semantic/semantic-map.model";

@Component({
    moduleId: module.id,
    selector: 'semantic-sketchpad',
    templateUrl: 'semantic-sketch-dialog.component.html',
    styleUrls: ['semantic-sketch-dialog.component.css']
})
export class SemanticSketchDialogComponent implements OnInit, AfterViewInit {

    /** Default linesize when opening the dialog. */
    public static readonly DEFAULT_LINESIZE = 10.0;

    /** */
    private _categories: SemanticCategory[] = [
        new SemanticCategory('Airplane'),
        new SemanticCategory('Animal'),
        new SemanticCategory('Apparel'),
        new SemanticCategory('Armchair'),
        new SemanticCategory('Ashcan'),
        new SemanticCategory('Awning'),
        new SemanticCategory('Bag'),
        new SemanticCategory('Ball'),
        new SemanticCategory('Bannister'),
        new SemanticCategory('Bar'),
        new SemanticCategory('Barrel'),
        new SemanticCategory('Base'),
        new SemanticCategory('Basket'),
        new SemanticCategory('Bathtub'),
        new SemanticCategory('Bed'),
        new SemanticCategory('Bench'),
        new SemanticCategory('Bicycle'),
        new SemanticCategory('Bird'),
        new SemanticCategory('Blanket'),
        new SemanticCategory('Blind'),
        new SemanticCategory('Boat'),
        new SemanticCategory('Book'),
        new SemanticCategory('Bookcase'),
        new SemanticCategory('Booth'),
        new SemanticCategory('Bottle'),
        new SemanticCategory('Box'),
        new SemanticCategory('Bridge'),
        new SemanticCategory('Buffet'),
        new SemanticCategory('Building'),
        new SemanticCategory('Bus'),
        new SemanticCategory('Cabinet'),
        new SemanticCategory('Canopy'),
        new SemanticCategory('Car'),
        new SemanticCategory('Caravan'),
        new SemanticCategory('Case'),
        new SemanticCategory('Cat'),
        new SemanticCategory('Ceiling'),
        new SemanticCategory('Chair'),
        new SemanticCategory('Chandelier'),
        new SemanticCategory('Clock'),
        new SemanticCategory('Column'),
        new SemanticCategory('Computer'),
        new SemanticCategory('Counter'),
        new SemanticCategory('Countertop'),
        new SemanticCategory('Cow'),
        new SemanticCategory('Cradle'),
        new SemanticCategory('Curtain'),
        new SemanticCategory('Cushion'),
        new SemanticCategory('dence'),
        new SemanticCategory('Desk'),
        new SemanticCategory('Dishwasher'),
        new SemanticCategory('Dog'),
        new SemanticCategory('Door'),
        new SemanticCategory('Earth'),
        new SemanticCategory('Escalator'),
        new SemanticCategory('Fan'),
        new SemanticCategory('Fence'),
        new SemanticCategory('Field'),
        new SemanticCategory('Fireplace'),
        new SemanticCategory('Flag'),
        new SemanticCategory('Floor'),
        new SemanticCategory('Flower'),
        new SemanticCategory('Food'),
        new SemanticCategory('Fountain'),
        new SemanticCategory('Glass'),
        new SemanticCategory('Grandstand'),
        new SemanticCategory('Grass'),
        new SemanticCategory('Ground'),
        new SemanticCategory('Guardrail'),
        new SemanticCategory('Hill'),
        new SemanticCategory('Hood'),
        new SemanticCategory('House'),
        new SemanticCategory('Hovel'),
        new SemanticCategory('Kitchen'),
        new SemanticCategory('Lake'),
        new SemanticCategory('Lamp'),
        new SemanticCategory('Land'),
        new SemanticCategory('Light'),
        new SemanticCategory('Microwave'),
        new SemanticCategory('Minibike'),
        new SemanticCategory('Mirror'),
        new SemanticCategory('Monitor'),
        new SemanticCategory('Motorbike'),
        new SemanticCategory('Mountain'),
        new SemanticCategory('Ottoman'),
        new SemanticCategory('Oven'),
        new SemanticCategory('Painting'),
        new SemanticCategory('Palm'),
        new SemanticCategory('Parking'),
        new SemanticCategory('Path'),
        new SemanticCategory('Person'),
        new SemanticCategory('Pier'),
        new SemanticCategory('Pillow'),
        new SemanticCategory('Plant'),
        new SemanticCategory('Plate'),
        new SemanticCategory('Plaything'),
        new SemanticCategory('Pole'),
        new SemanticCategory('Poster'),
        new SemanticCategory('Pot'),
        new SemanticCategory('PottedPlant'),
        new SemanticCategory('Radiator'),
        new SemanticCategory('Refrigerator'),
        new SemanticCategory('Rider'),
        new SemanticCategory('River'),
        new SemanticCategory('Road'),
        new SemanticCategory('Rock'),
        new SemanticCategory('Rug'),
        new SemanticCategory('Runway'),
        new SemanticCategory('Sand'),
        new SemanticCategory('Sconce'),
        new SemanticCategory('Screen'),
        new SemanticCategory('Sculpture'),
        new SemanticCategory('Sea'),
        new SemanticCategory('Seat'),
        new SemanticCategory('Sheep'),
        new SemanticCategory('Shelf'),
        new SemanticCategory('Ship'),
        new SemanticCategory('Shower'),
        new SemanticCategory('Sidewalk'),
        new SemanticCategory('Signboard'),
        new SemanticCategory('Sink'),
        new SemanticCategory('Sky'),
        new SemanticCategory('Skyscraper'),
        new SemanticCategory('Sofa'),
        new SemanticCategory('Stage'),
        new SemanticCategory('Stairs'),
        new SemanticCategory('Stairway'),
        new SemanticCategory('Step'),
        new SemanticCategory('Stool'),
        new SemanticCategory('Stove'),
        new SemanticCategory('Streetlight'),
        new SemanticCategory('Table'),
        new SemanticCategory('Tank'),
        new SemanticCategory('Television'),
        new SemanticCategory('Tent'),
        new SemanticCategory('Terrain'),
        new SemanticCategory('Toilet'),
        new SemanticCategory('Towel'),
        new SemanticCategory('Tower'),
        new SemanticCategory('Trailer'),
        new SemanticCategory('Train'),
        new SemanticCategory('Tray'),
        new SemanticCategory('Tree'),
        new SemanticCategory('Truck'),
        new SemanticCategory('Tunnel'),
        new SemanticCategory('TV'),
        new SemanticCategory('Van'),
        new SemanticCategory('Vase'),
        new SemanticCategory('Vegetation'),
        new SemanticCategory('Wall'),
        new SemanticCategory('Wardrobe'),
        new SemanticCategory('Washer'),
        new SemanticCategory('Water'),
        new SemanticCategory('Waterfall'),
        new SemanticCategory('Windowpane')
    ];

    /** */
    public selected : SemanticCategory = this._categories[0];

    /** Hidden input for image upload. */
    @ViewChild('imageloader')
    private imageloader: any;

    /** Sketch-canvas component. */
    @ViewChild('sketch')
    private _sketchpad: SketchCanvas;

    /** Current linesize (default: DEFAULT_LINESIZE). */
    public linesize: number = SemanticSketchDialogComponent.DEFAULT_LINESIZE;

    /**
     *
     * @param _dialogRef
     * @param _data
     */
    constructor(private _dialogRef: MatDialogRef<SemanticSketchDialogComponent>, @Optional() @Inject(MAT_DIALOG_DATA) private _data : SemanticMap) {}

    /**
     * Lifecycle Hook (onInit): Loads the injected image data (if specified).
     */
    public ngOnInit(): void {
        if(this._data)  {
            this._sketchpad.setImageBase64(this._data.image);
            this._categories.splice(0, this._categories.length);
            this._data.map.forEach(v => this._categories.push(v));
            this._data = null;
        }
    }

    /**
     * Lifecycle Hook (afterViewInit): Sets the default linesize and colour.
     */
    public ngAfterViewInit(): void {
        this._sketchpad.setLineSize(this.linesize);
    }

    /**
     *
     */
    get categories(): SemanticCategory[] {
        return this._categories;
    }

    /**
     * Triggered when a color value is selected.
     *
     * @param color
     */
    public onItemSelected(selection: SemanticCategory) {
        this.selected = selection;
        this._sketchpad.setActiveColor(selection.color)
    }

    /**
     * Triggered when the slider-value for the line-size changes.
     */
    public onLineSizeChange() {
        this._sketchpad.setLineSize(this.linesize);
    }

    /**
     * Triggered when the 'Clear canvas' menu-item is pressed.
     *
     * Clears the canvas
     */
    public onClearCanvasClicked() {
        this._sketchpad.clearCanvas();
    }

    /**
     * Triggered when the 'Fill canvas' menu-item is pressed.
     *
     * Fills the canvas with the default color.
     */
    public onFillCanvasClicked() {
        this._sketchpad.fillCanvas();
    }

    /**
     * Closes the dialog.
     */
    public close() {
        this._dialogRef.close(new SemanticMap(this._sketchpad.getImageBase64(), this._categories));
    }
}