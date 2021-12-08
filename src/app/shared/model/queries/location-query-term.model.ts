import {AbstractQueryTerm} from './abstract-query-term.model';
import {QueryTerm} from '../../../../../openapi/cineast';


export interface Location {
  latitude: number;
  longitude: number;
}

export class LocationQueryTerm extends AbstractQueryTerm {

  public location: Location = {latitude: 51.50906, longitude: -0.15095}; // TODO DEBUG London

  constructor() {
    super(QueryTerm.TypeEnum.LOCATION, ['spatialdistance']); // Cineast Category
  }

  public write() {
    this.setLocation(this.location);
  }

  public read() {
    this.location = this.getLocation();
  }

  public setLocation(loc: Location) {
    this.data = `[${loc.latitude},${loc.longitude}]`
  }

  public getLocation() {
    try {
      if(this.data.length === 0){
        return null; // Obviously nothing to parse
      }
      const _data = JSON.parse(this.data);
      if (_data) {
        return {latitude: _data[0], longitude: _data[1]} as Location;
      } else {
        return null;
      }

    } catch (e) {
      return null; // don't care if there is nothing to
    }
  }

}
