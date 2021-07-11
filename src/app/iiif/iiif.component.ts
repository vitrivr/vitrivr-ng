import {Component, OnInit} from '@angular/core';
import * as dragon from 'openseadragon'

@Component({
  selector: 'app-iiif',
  templateUrl: './iiif.component.html',
  styleUrls: ['./iiif.component.css']
})
export class IiifComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    const viewer = dragon({
      id: 'openseadragon',
      preserveViewport: true,
      visibilityRatio: 1,
      minZoomLevel: 1,
      defaultZoomLevel: 1,
      tileSources: ['https://micr.io/i/XOrtH/info.json'],
      prefixUrl: 'https://openseadragon.github.io/openseadragon/images/'
    });
  }

}
