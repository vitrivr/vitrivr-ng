import {ChangeDetectionStrategy, Component} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent {

}