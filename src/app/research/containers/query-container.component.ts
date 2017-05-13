import {Component, Input} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryTermType} from "../../shared/model/queries/interfaces/query-term-type.interface";

@Component({
    selector: 'query-container',
    template:`
        <md-card style="margin:10px;padding:10px;">
            <md-card-header style="margin-bottom:15px;">
                 <button (click)="onToggleButtonClicked('IMAGE')" class="icon-button">
                    <md-icon [attr.class]="containerModel.hasTerm('IMAGE') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">panorama</md-icon>
                 </button>
                 <div class="spacer-small"></div>
                 <button (click)="onToggleButtonClicked('AUDIO')" class="icon-button">
                    <md-icon [attr.class]="containerModel.hasTerm('AUDIO') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">audiotrack</md-icon>
                 </button>
                 <div class="spacer-small"></div>
                 <button (click)="onToggleButtonClicked('MODEL3D')" class="icon-button">
                    <md-icon [attr.class]="containerModel.hasTerm('MODEL3D') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">3d_rotation</md-icon>
                 </button>
                 <div class="spacer-flex"></div>
                 <button class="icon-button" (click)="onRemoveButtonClicked()"><md-icon>close</md-icon></button>
            </md-card-header>
            <md-card-content>
                <qt-image *ngIf="containerModel.hasTerm('IMAGE')" [imageTerm]="containerModel.getTerm('IMAGE')"></qt-image>
                <qt-audio *ngIf="containerModel.hasTerm('AUDIO')" [audioTerm]="containerModel.getTerm('AUDIO')"></qt-audio>
                <qt-m3d *ngIf="containerModel.hasTerm('MODEL3D')" [m3dTerm]="containerModel.getTerm('MODEL3D')"></qt-m3d>
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
     * Triggered, when a user clicks the remove-button (top-right corner). Removes
     * the QueryContainerComponent from the list.
     */
    public onRemoveButtonClicked() {
        let index = this.inList.indexOf(this.containerModel);
        if (index > -1) {
            this.inList.splice(index, 1)
        }
    }

    /**
     *
     * @param type
     */
    public onToggleButtonClicked(type: QueryTermType) {
         if (this.containerModel.hasTerm(type)) {
             this.containerModel.removeTerm(type);
         } else {
             this.containerModel.addTerm(type);
         }
    }
}