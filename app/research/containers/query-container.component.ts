import {Component, Input} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryContainer} from "../../shared/model/queries/query-container.model";
import {ImageQueryTerm} from "../../shared/model/queries/image-query-term.model";
import {AudioQueryTerm} from "../../shared/model/queries/audio-query-term.model";

@Component({
    selector: 'query-container',
    template:`
        <md-card style="margin:10px;padding:10px;">
            <md-card-header>
                 <button (click)="handleToggleImageTerm()" class="icon-button">
                    <md-icon [attr.class]="hasImageTerm() ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">panorama</md-icon>
                 </button>
                 <div class="spacer-small"></div>
                 <button (click)="handleToggleAudioTerm()" class="icon-button">
                    <md-icon [attr.class]="hasAudioTerm() ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">audiotrack</md-icon>
                 </button>
                 <div class="spacer-flex"></div>
                 <button class="icon-button" (click)="handleRemove()"><md-icon>close</md-icon></button>
            </md-card-header>
            <md-card-content>
                <qt-image *ngIf="hasImageTerm()" [imageTerm]="containerModel.imageQueryTerm"></qt-image>
                <qt-audio *ngIf="hasAudioTerm()"></qt-audio>
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
    private handleToggleImageTerm() {
        if (this.containerModel.imageQueryTerm == null) {
            this.containerModel.imageQueryTerm = new ImageQueryTerm();
        } else {
            this.containerModel.imageQueryTerm = null;
        }
    }

    /**
     *
     */
    private handleToggleAudioTerm() {
        if (this.containerModel.audioQueryTerm == null) {
            this.containerModel.audioQueryTerm = new AudioQueryTerm();
        } else {
            this.containerModel.audioQueryTerm = null;
        }
    }


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
     * @returns {boolean}
     */
    private hasImageTerm() {
        return this.containerModel.imageQueryTerm != null;
    }

    /**
     *
     * @returns {boolean}
     */
    private hasAudioTerm() {
        return this.containerModel.audioQueryTerm != null;
    }


}