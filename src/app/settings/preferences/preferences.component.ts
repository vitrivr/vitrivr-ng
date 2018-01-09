import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'preferences',
    templateUrl: './preferences.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PreferencesComponent {

    /**
     * Constructor for PreferencesComponent
     */
    constructor() {
    }
}