import {Component, ViewChild, Input} from "@angular/core";

import {MatDialog} from '@angular/material';
import {AudioRecorderDialogComponent} from "./audio-recorder-dialog.component";
import {AudioQueryTerm} from "../../../shared/model/queries/audio-query-term.model";

@Component({
    selector: 'qt-audio',
    templateUrl: 'audio-query-term.component.html',
    styleUrls: ['audio-query-term.component.css']
})
export class AudioQueryTermComponent {
    /** Component used to display a preview of the recorded/selected audio. */
    @ViewChild('player') private player: any;

    /** The AudioQueryTerm object associated with this AudioQueryTermComponent. That object holds all the query-settings. */
    @Input() audioTerm: AudioQueryTerm;

    /** Value of the slider. */
    public sliderSetting : number;

    /**
     * Default constructor.
     *
     * @param dialog
     */
    constructor(private dialog: MatDialog) {}

    /**
     * This method is invoked whenever the slider value changes. Updates the feature categories for this AudioQueryTerm based
     * on a linear, numerical scale.
     *
     * @param event
     */
    public onSliderChanged(event:any) {
        switch (this.sliderSetting) {
            case 0:
                this.audioTerm.setCategories(['audiofingerprint']);
                break;
            case 1:
                this.audioTerm.setCategories(['audiofingerprint', 'audiomatching']);
                break;
            case 2:
                this.audioTerm.setCategories(['audiomatching', 'hpcpaverage']);
                break;
            case 3:
                this.audioTerm.setCategories(['audiomelody', 'pitchsequence']);
                break;
            case 4:
                this.audioTerm.setCategories(['pitchsequence']);
                break;
            default:
                this.audioTerm.setCategories(['audiofingerprint', 'audiomatching']);
                break;
        }
    }

    /**
     * This method is invoked, whenever someone clicks on the preview-image
     * of the AudioQueryTermComponent.
     *
     * Shows the audio-recorder dialog.
     */
    public onViewerClicked() {
        this.openAudioRecorderDialog();
    }

    /**
     * Fired whenever something is dragged and enters the audio player.
     *
     * @param event
     */
    public onAudioDragEnter(event: any) {
        event.preventDefault();
        event.target.classList.add('ondrag');
    }

    /**
     * Fired whenever something is dragged over the audio player.
     *
     * @param event
     */
    public onAudioDragOver(event: any) {
        event.preventDefault();
    }

    /**
     * Fired whenever something is dragged and exits the audio player.
     *
     * @param event
     */
    public onAudioDragExit(event: any) {
        event.preventDefault();
        event.target.classList.remove("ondrag");
    }

    /**
     * Fired when object is dropped over the audio player. If the object is a file, that
     * object is treated as audio and handed to the SketchDialogComponent.
     *
     * @param event Drop event
     */
    public onAudioDropped(event: any) {
        /* Prevent propagation. */
        event.preventDefault();
        event.stopPropagation();

        /* Remove the ondrag class (change of border-style). */
        event.target.classList.remove("ondrag");

        /** */
        if (event.dataTransfer.files.length > 0) {
            let file = event.dataTransfer.files.item(0);
            this.openAudioRecorderDialog(file);
        }
    }

    /**
     * Opens the AudioRecorderDialogComponent and registers a callback that loads the saved
     * result of the dialog into the audio player.
     *
     * @param data Optional data that should be handed to the component.
     */
    private openAudioRecorderDialog(data?: any) {
        let dialogRef = this.dialog.open(AudioRecorderDialogComponent, {data : data});
        let subscription = dialogRef.afterClosed().first().subscribe(result => {
            if (result) {
                result.then((data: Blob) => {
                    this.player.nativeElement.src = URL.createObjectURL(data);
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        this.audioTerm.data = reader.result;
                    };
                    reader.readAsDataURL(data);
                })
            }
            subscription.unsubscribe();
        });
    }
}