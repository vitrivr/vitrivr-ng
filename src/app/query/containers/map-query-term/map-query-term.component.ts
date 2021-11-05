import {AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Location, LocationQueryTerm} from '../../../shared/model/queries/location-query-term.model';
import * as L from 'leaflet';
import {LatLng} from 'leaflet';
import {MatDialog} from '@angular/material/dialog';
import {MapDialogComponent} from './map-dialog/map-dialog.component';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-map-query-term',
  templateUrl: './map-query-term.component.html',
  styleUrls: ['./map-query-term.component.css']
})
export class MapQueryTermComponent implements AfterViewInit, OnInit, OnDestroy {


  @ViewChild('mapdiv', {static: true})
  private map: ElementRef<HTMLElement>; // the element ref

  private minimap;

  private readonly defaultLocation = {latitude: 0, longitude: 0} as Location;

  @Input()
  private locationTerm: LocationQueryTerm;

  constructor(private dialog: MatDialog) {
  }

  ngAfterViewInit(): void {
    console.log(`On AfterInit`);
    this.initMiniMap();
  }

  openMapDialog() {
    const dialogRef = this.dialog.open(MapDialogComponent, {width: '900px', height: '800px'});
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result) {
        console.log(`RESULT: ${JSON.stringify(result)}`);
        this.locationTerm.location = result as Location;
        this.locationTerm.write();
        console.log(`TERM: ${JSON.stringify(this.locationTerm)}`)
      }
      this.reInitMap();
    });
  }

  ngOnInit(): void {
    console.log(`On Init`);
    if (this.locationTerm) {
      this.locationTerm.read();
    }
  }

  ngOnDestroy(): void {
    if (this.minimap) {
      console.log(`Destroy`)
      this.minimap.off();
      this.minimap.remove();
    }
  }

  private initMiniMap(zoom: number = 2) {
    console.log(`LocationTerm: ${JSON.stringify(this.locationTerm)}`)

    if (this.minimap) {
      /* If the map already exists */
      this.reInitMap();
      return;
    }
    console.log('initMap');

    // Default init for minimap :-D
    this.minimap = new L.Map(this.map.nativeElement, {
      center: this.locationTerm && this.locationTerm.location ? [this.locationTerm.location.latitude, this.locationTerm.location.longitude] : [this.defaultLocation.latitude, this.defaultLocation.longitude],
      zoom: zoom,
      zoomControl: false, // Its only a minimap, no controls allowed
      attributionControl: false, // Its only a minimap, who cares,
      dragging: false // This is just the minimap
    });


    const tiles = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 0,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    tiles.addTo(this.minimap);

    this.minimap.invalidateSize(false);

    if(this.locationTerm && this.locationTerm.location){
      this.setMarkerIfNeeded();
    }
    console.log(`fin`)

  }

  private reInitMap() {
    const loc = this.locationTerm && this.locationTerm.location ? this.locationTerm.location : this.defaultLocation;
    this.minimap.setView(
      new LatLng(loc.latitude, loc.longitude),  // center
      2                                         // zoom
    );

    this.setMarkerIfNeeded();
  }

  private setMarkerIfNeeded(){
    const marker = new L.Marker(new LatLng(this.locationTerm.location.latitude, this.locationTerm.location.longitude));
    marker.addTo(this.minimap);
  }
}
