import {Component, Input} from "@angular/core";
import {QueryContainerInterface} from "../../shared/model/queries/interfaces/query-container.interface";
import {QueryTermType} from "../../shared/model/queries/interfaces/query-term-type.interface";
import {ConfigService} from "../../core/basics/config.service";
import {Config} from "../../core/basics/config.model";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'query-container',
    template:`
        <md-card style="margin:10px;padding:10px;">
            <md-card-header style="margin-bottom:15px;">
                <button *ngIf="this._config.queryContainerTypes.image" (click)="onToggleButtonClicked('IMAGE')" class="icon-button" mdTooltip="Toggle image query term">
                <md-icon [attr.class]="containerModel.hasTerm('IMAGE') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">panorama</md-icon>
                </button>
                <div *ngIf="this._config.queryContainerTypes.image" class="spacer-small"></div>
                <button *ngIf="this._config.queryContainerTypes.audio" (click)="onToggleButtonClicked('AUDIO')" class="icon-button" mdTooltip="Toggle audio query term">
                <md-icon [attr.class]="containerModel.hasTerm('AUDIO') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">audiotrack</md-icon>
                </button>
                <div *ngIf="this._config.queryContainerTypes.audio" class="spacer-small"></div>
                <button  *ngIf="this._config.queryContainerTypes.model3d" (click)="onToggleButtonClicked('MODEL3D')" class="icon-button" mdTooltip="Toggle 3D query term">
                <md-icon [attr.class]="containerModel.hasTerm('MODEL3D') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">3d_rotation</md-icon>
                </button>
                <div *ngIf="this._config.queryContainerTypes.model3d" class="spacer-small"></div>
                <button *ngIf="this._config.queryContainerTypes.motion" (click)="onToggleButtonClicked('MOTION')" class="icon-button" mdTooltip="Toggle motion query term">
                <md-icon [attr.class]="containerModel.hasTerm('MOTION') ? 'material-icons md-primary-250' : 'material-icons md-primary-100'">directions_run</md-icon>
                </button>
                <div class="spacer-flex"></div>
                <button class="icon-button" (click)="onRemoveButtonClicked()" mdTooltip="Remove query container"><md-icon>close</md-icon></button>
            </md-card-header>
            <md-card-content>
                <qt-image *ngIf="containerModel.hasTerm('IMAGE')" [imageTerm]="containerModel.getTerm('IMAGE')"></qt-image>
                <qt-audio *ngIf="containerModel.hasTerm('AUDIO')" [audioTerm]="containerModel.getTerm('AUDIO')"></qt-audio>
                <qt-m3d *ngIf="containerModel.hasTerm('MODEL3D')" [m3dTerm]="containerModel.getTerm('MODEL3D')"></qt-m3d>
                <qt-motion *ngIf="containerModel.hasTerm('MOTION')" [motionTerm]="containerModel.getTerm('MOTION')"></qt-motion>
            </md-card-content>
        </md-card>
    `
})

export class QueryContainerComponent {
    /* The QueryContainer this QueryContainerComponent is associated to. */
    @Input() containerModel : QueryContainerInterface;

    /* A reference to the lists of QueryContainers (to enable remvoing the container). */
    @Input() inList : QueryContainerInterface[];


    private _config: Config;
    private _configServiceSubscription: Subscription;


    constructor(private _configService: ConfigService) {}

    public ngOnInit(): void {

        this._configServiceSubscription = this._configService.observable.subscribe((config) => {
            this._config = config;
        })
    }

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
