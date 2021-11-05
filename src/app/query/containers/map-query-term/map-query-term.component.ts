import {AfterViewInit, Component, Input, OnInit} from '@angular/core';
import {Location, LocationQueryTerm} from '../../../shared/model/queries/location-query-term.model';
import * as L from 'leaflet';
import {MatDialog} from '@angular/material/dialog';
import {MapDialogComponent} from './map-dialog/map-dialog.component';
import {first} from 'rxjs/operators';

@Component({
  selector: 'app-map-query-term',
  templateUrl: './map-query-term.component.html',
  styleUrls: ['./map-query-term.component.css']
})
export class MapQueryTermComponent implements AfterViewInit, OnInit {

  private minimap;

  private readonly defaultLocation = {latitude: 0, longitude: 0} as Location;

  @Input()
  private locationTerm: LocationQueryTerm;

  constructor(private dialog: MatDialog) {
  }

  ngAfterViewInit(): void {
    this.initMiniMap();
  }

  openMapDialog() {
    this.minimap.off();
    this.minimap.remove();
    const dialogRef = this.dialog.open(MapDialogComponent, {width: '900px', height: '800px'});
    dialogRef.afterClosed().pipe(first()).subscribe(result => {
      if (result) {
        console.log(`RESULT: ${JSON.stringify(result)}`);
        this.locationTerm.location = result as Location;
        this.locationTerm.write();
        console.log(`TERM: ${JSON.stringify(this.locationTerm)}`)
        this.initMiniMap(4);
      }
      this.initMiniMap();
    });
  }

  ngOnInit(): void {
    if (this.locationTerm) {
      this.locationTerm.read();
    }
  }

  private initMiniMap(zoom: number = 2) {
    console.log(`LocationTerm: ${JSON.stringify(this.locationTerm)}`)
    // Default init for minimap :-D
    this.minimap = L.map('map', {
      center: this.locationTerm && this.locationTerm.location ? [this.locationTerm.location.latitude, this.locationTerm.location.longitude] : [this.defaultLocation.latitude, this.defaultLocation.longitude],
      zoom: zoom,
      zoomControl: false, // Its only a minimap, no controls allowed
      attributionControl: false, // Its only a minimap, who cares,
      dragging: false // This is just the minimap
    });

    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 0,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    tiles.addTo(this.minimap);
  }
}
