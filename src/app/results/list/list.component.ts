import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";

@Component({
    moduleId: module.id,
    selector: 'list',
    templateUrl: 'list.component.html',
    styleUrls: ['list.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListComponent implements OnInit, OnDestroy {

    /**
     *
     */
    public ngOnDestroy(): void {
        throw new Error("Method not implemented.");
    }

    /**
     *
     */
    public ngOnInit(): void {
        throw new Error("Method not implemented.");
    }

}