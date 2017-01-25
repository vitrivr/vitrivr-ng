import {Component, Input} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";

@Component({
    selector: 'query-container',
    template:`
        <md-card style="margin:10px;padding:10px;">
            <md-card-header>
                 <div class="spacer-flex"></div>
                 <button class="icon-button" (click)="remove()"><md-icon>close</md-icon></button>
            </md-card-header>
            <md-card-content>
                <qt-image *ngIf="hasImage()" [imageTerm]="hasImage() ? container.imageQueryTerm : null"></qt-image>
            </md-card-content>
        </md-card>
    `
})

export class QueryContainerComponent {
    @Input() container : QueryContainerInterface;
    @Input() inList : QueryContainerInterface[];

    /**
     *
     * @returns {boolean}
     */
    hasImage() {
        return this.container.imageQueryTerm != undefined;
    }

    /**
     *
     */
    remove() {
        let index = this.inList.indexOf(this.container);
        if (index > -1) {
            this.inList.splice(index, 1)
        }
    }
}