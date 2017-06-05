import {Component, Input, ViewChild} from "@angular/core";
import {MotionQueryTerm} from "../../../shared/model/queries/motion-query-term.model";
@Component({
    selector: 'qt-motion',
    templateUrl: 'motion-query-term.component.html',
    styleUrls: ['motion-query-term.component.css']
})
export class MotionQueryTermComponent {
    /** The MotionQueryTerm object associated with this MotionQueryTermComponent. That object holds all the query-settings. */
    @Input()
    private motionTerm: MotionQueryTerm;

    /** Component used to display a preview of the selected AND/OR sketched image. */
    @ViewChild('previewimg')
    private previewimg: any;

    /**
     * Triggered whenever someone click on the image, which indicates that it should
     * be edited; opens the MotionSketchDialogComponent
     */
    public onViewerClicked() {
    }
}