import {Component, Input} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../../shared/model/queries/query-container.model";
import {ImageQueryTerm} from "../../shared/model/queries/image-query-term.model";
import {AudioQueryTerm} from "../../shared/model/queries/audio-query-term.model";
import {QueryTermType, QueryTermInterface} from "../../shared/model/queries/interfaces/query-term.interface";

@Component({
    selector: 'query-container',
    template:`
        <md-card style="margin:10px;padding:10px;">
            <md-card-header>
                 <button (click)="toggle('IMAGE')" class="icon-button">
                    <md-icon [attr.class]="containerModel.hasTerm('IMAGE') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">panorama</md-icon>
                 </button>
                 <div class="spacer-small"></div>
                 <button (click)="toggle('AUDIO')" class="icon-button">
                    <md-icon [attr.class]="containerModel.hasTerm('AUDIO') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">audiotrack</md-icon>
                 </button>
                 <div class="spacer-flex"></div>
                 <button class="icon-button" (click)="handleRemove()"><md-icon>close</md-icon></button>
            </md-card-header>
            <md-card-content>
                <qt-image *ngIf="containerModel.hasTerm('IMAGE')" [imageTerm]="containerModel.getTerm('IMAGE')"></qt-image>
                <qt-audio *ngIf="containerModel.hasTerm('AUDIO')"></qt-audio>
            </md-card-content>
        </md-card>
    `
})

export class QueryContainerComponent {
    /* The QueryContainer this QueryContainerComponent is associated to. */
    @Input() containerModel : QueryContainerInterface;

    /* A reference to the lists of QueryContainers (to enable remvoing the container). */
    @Input() inList : QueryContainerInterface[];

    /**
     *
     */
    private handleRemove() {
        let index = this.inList.indexOf(this.containerModel);
        if (index > -1) {
            this.inList.splice(index, 1)
        }
    }

    /**
     *
     * @param type
     */
    private toggle(type: QueryTermType) {
         if (this.containerModel.hasTerm(type)) {
             this.containerModel.removeTerm(type);
         } else {
             this.containerModel.addTerm(type);
         }
    }
}