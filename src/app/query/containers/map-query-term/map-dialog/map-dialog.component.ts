import {AfterViewInit, Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Location} from '../../../../shared/model/queries/location-query-term.model';
import * as L from 'leaflet';
import {FeatureGroup} from 'leaflet';
import {GeoSearchControl, OpenStreetMapProvider} from 'leaflet-geosearch';

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css']
})
export class MapDialogComponent implements AfterViewInit {
  private readonly defaultLocation = {latitude: 0, longitude: 0} as Location;

  private map;

  private clickMarkerGroup: FeatureGroup;

  private location: Location;

  constructor(private _dialogRef: MatDialogRef<MapDialogComponent>, @Inject(MAT_DIALOG_DATA) private _data: Location) {
    // _dialogRef.disableClose = true;
    this.location = _data ? _data : this.defaultLocation;

  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  close() {
    this.map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        const m = (layer) as L.Marker;
        this.location = {latitude: m.getLatLng().lat, longitude: m.getLatLng().lng};
      }
    })
    this._dialogRef.close(this.location);
  }

  private initMap() {
    console.log(`MapDialog: ${JSON.stringify(this.location)}`)
    // Default init for minimap :-D
    this.map = new L.Map('mainmap', {
      center: [this.location.latitude, this.location.longitude],
      zoom: 2,
    });

    this.clickMarkerGroup = new L.FeatureGroup();

    const tiles = new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 0,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    this.clickMarkerGroup.addTo(this.map);

    tiles.addTo(this.map);

    this.map.on('click', (e) => {
      // Click event: Add new marker
      this.map.eachLayer((layer) => {
        // Remove previous markers
        if (layer instanceof L.Marker) {
          this.map.removeLayer(layer);
        }
      });
      const marker = new L.Marker(e.latlng);
      marker.addTo(this.clickMarkerGroup);
    });

    const provider = new OpenStreetMapProvider();

    // @ts-ignore
    const searchControl = new GeoSearchControl({provider: provider, style: 'bar'});

    searchControl.markers.on('layeradd', (e) => {
      // Remove own markers to always only have one.
      this.clickMarkerGroup.clearLayers();
    });

    this.map.addControl(searchControl);
  }
}





