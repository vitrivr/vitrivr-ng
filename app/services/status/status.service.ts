import {Injectable}     from '@angular/core';
import {Observable}     from 'rxjs/Observable';
import {StatusInterface} from "./status.component";
import {AbstractService} from "../service.interface";

@Injectable()
export class StatusService extends AbstractService {
    getStatus (): Observable<StatusInterface> {
        return this._http.get(this.url('status'))
            .map(response => response.json())
            .catch(this.handleError);
    }
}
