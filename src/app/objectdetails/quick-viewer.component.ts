import {AfterViewInit, Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MD_DIALOG_DATA} from "@angular/material";
import {MediaObjectScoreContainer} from "../shared/model/features/scores/media-object-score-container.model";
import {SegmentScoreContainer} from "../shared/model/features/scores/segment-score-container.model";
import {ResolverService} from "../core/basics/resolver.service";
@Component({
    moduleId: module.id,
    selector: 'quick-viewer',
    templateUrl: 'quick-viewer.component.html'
})
export class QuickViewerComponent implements AfterViewInit {

    /** Reference to the audio player. */
    @ViewChild('audioplayer')
    private audioplayer: any;

    /** Reference to the video player. */
    @ViewChild('videoplayer')
    private videoplayer: any;

    /** Reference to the img tag for preview. */
    @ViewChild('imageviewer')
    private imageviewer: any;

    /** SegmentScoreContainer that is currently in focus. */
    private _segment: SegmentScoreContainer;

    /**
     * Default constructor; injects the necessary fields.
     *
     * @param data The MediaObjectScoreContainer or SegmentScoreContainer that should be displayed.
     * @param _resolver ResolverService reference that is being injected.
     */
    public constructor(@Inject(MD_DIALOG_DATA) data: any, private _resolver: ResolverService) {
        if (data instanceof MediaObjectScoreContainer) {
            this._segment = data.representativeSegment;
        } else if (data instanceof SegmentScoreContainer) {
            this._segment = data;
        } else {
            throw new Error("You must either provide a MediaObjectScoreContainer or a SegmentScoreContainer to an instance von QuickViewerComponent!");
        }
    }

    /**
     * View Lifecycle (after init): Start video / audio playback automatically.
     */
    public ngAfterViewInit(): void {
        this.playAtCurrentPosition()
    }

    /**
     * If the current SegmentScoreContainer belongs either to a video or audio file, this
     * method will start playback of the respective player at the position specified by the
     * current segment.
     *
     * For all the other media types, this method has no effect.
     */
    public playAtCurrentPosition() {
        if (this._segment.objectScoreContainer.mediatype === "AUDIO") {
            this.audioplayer.nativeElement.currentTime = this._segment.starttime;
            this.audioplayer.nativeElement.play();
        } else if (this._segment.objectScoreContainer.mediatype === "VIDEO") {
            this.videoplayer.nativeElement.currentTime = this._segment.starttime;
            this.videoplayer.nativeElement.play();
        }
    }

    /* TODO: Add support for submission to VBS.*/

    /**
     * Getter for SegmentScoreContainer.
     *
     * @return {SegmentScoreContainer}
     */
    get segment(): SegmentScoreContainer {
        return this._segment;
    }

    /**
     * Getter for SegmentScoreContainer.
     *
     * @return {SegmentScoreContainer}
     */
    get mediaobject(): MediaObjectScoreContainer {
        return this._segment.objectScoreContainer;
    }
}