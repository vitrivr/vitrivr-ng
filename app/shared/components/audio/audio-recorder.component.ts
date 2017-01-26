import {Component, ViewChild, OnInit, OnDestroy, Input} from "@angular/core";

@Component({
    selector: 'record-audio',
    template:`
    <div>
        <canvas #visualize width='{{width}}' height='{{height}}'></canvas>
    </div>`
})

/**
 * This is a simple AudioRecordingComponent that uses navigator.getUserMedia to access the user's microphone. The
 * component comes without UI except for a visualization canvas. Therefore, it must be embedded by another
 * component in order to be useful.
 *
 * The component has public methods to start and stop recording or playback. Furthermore, one can manually load
 * data from an audio file.
 */
export class AudioRecorderComponent implements OnInit, OnDestroy {
    /** Canvas used for visualization. */
    @ViewChild('visualize') private canvas: any;

    /** Width and height of the visualization canvas. */
    @Input() width: number = 400;
    @Input() height: number = 150;

    /** */
    readonly audiocontext : AudioContext = new AudioContext();

    /** MediaStream that is obtained by calls to navigator.getUserMedia. Represents the microphone audio source.*/
    private stream: MediaStream;

    /** The SourceNode for audio. Uses the MediaStream coming from the microphone. */
    private source : MediaStreamAudioSourceNode;

    /** The AnalyserNode used to visualize the microphone input. */
    private analyser : AnalyserNode;

    /** The ScriptProcessorNode that does the actual audio recording. */
    private processor: ScriptProcessorNode;

    /** A AudioBufferSourceNode that can be used to play previously buffered audio. */
    private bufferSource: AudioBufferSourceNode;

    /** Array used to buffer data required for visualization of the audio-input. */
    private visualizationDataArray : Uint8Array;

    /** The number of frequency-bins (for visualization of the audio-input). */
    private frequencyBinCount: number;

    /** Buffers the raw PCM data during recording or after file-upload for later playback or storage. This array has one
     * Float32Array entry per recorded frame in the audio stream. The length of such a Float32Array depends on the
     * audio data.
     *
     * For 44100Hz sample rate its usually {44100 * channels} entries, i.e. 44100 entries for mono audio.
     */
    private recordingBuffer : Float32Array[] = [];

    /** Flag indicating whether any recording is currently taking place. */
    private recording: boolean = false;

    /** Flag indicating whether any playback is currently taking place. */
    private playing: boolean = false;

    /**
     * Requests access to the user's microphone. If this succeeds, a MediaStream object is passed
     * to the onStreamAvailable() method.
     */
    ngOnInit() {
        navigator.getUserMedia({audio: true, video: false},
            (stream: MediaStream) => this.onStreamAvailable(stream),
            (err) => this.onStreamError(err)
        );
    }

    /**
     * Stops the recording (if it's still running) and closes all open tracks, thus releasing
     * the media-stream.
     */
    ngOnDestroy() {
        if (this.isRecording()) this.stop();
        this.stream.getTracks().forEach((track) => {
            track.stop()
        });
        this.recordingBuffer = [];
    }

    /**
     * Starts recording of audio by connecting the MediaStreamAudioSourceNode to the
     * ScriptProcessorNode (SRC -> PP). The actual recording is done in the process()
     * method.
     */
    public record(): void {
        if (this.audiocontext == undefined) return;
        if (!this.recording && !this.playing) {
            this.recordingBuffer = [];
            this.analyser.connect(this.processor);
            this.processor.connect(this.audiocontext.destination);
            this.recording = true;
        }
    }

    /**
     * Starts playback of previously recorded audio (if defined).
     */
    public play(): void {
        if (this.audiocontext == undefined) return;
        if (!this.recording && !this.playing) {
            this.playing = true
            let audioBuffer = this.audiocontext.createBuffer(1, this.recordingBuffer.length * 44100, 44100);
            this.recordingBuffer.forEach((array, f) => {
                array.forEach((sample, s) => {
                    audioBuffer.getChannelData(0)[f*array.length + s] = sample;
                });
            });

            this.bufferSource.buffer = audioBuffer;
            this.bufferSource.connect(this.audiocontext.destination);
            this.bufferSource.start();
            this.bufferSource.onended = () => {
                this.bufferSource.disconnect(this.audiocontext.destination);
                this.playing = false;
            };
        }
    }

    /**
     * Stops either playback or recording, whatever is currently running.
     */
    public stop(): void {
        if (this.audiocontext == undefined) return;
        if (this.recording) {
            this.processor.disconnect(this.audiocontext.destination);
            this.analyser.disconnect(this.processor);
            this.recording = false;
        }

        if (this.playing) {
            this.bufferSource.stop();
        }
    }

    /**
     * Indicates whether or not the recorder is currently recording.
     *
     * @returns {boolean}
     */
    public isRecording(): boolean {
        return this.recording;
    }

    /**
     * Indicates whether or not the recorder is currently playing the
     * recorded audio.
     *
     * @returns {boolean}
     */
    public isPlaying(): boolean {
        return this.playing;
    }

    /**
     * Indicates whether the AudioRecordingComponent supports recording. This
     * mainly depends on the browser's capabilities.
     */
    public supportsRecording() {
        return this.audiocontext != undefined && this.stream != undefined;
    }

    /**
     *
     * @param stream
     */
    private onStreamAvailable(stream: MediaStream) {
        this.stream = stream;
        this.setupAudioNodes();
        this.visualize();
    }

    /**
     *
     * @param error
     */
    private onStreamError(error: any) {
        console.log(error);
    }


    /**
     * Does the setup of all the necessary audio-nodes. A MediaStreamAudioSourceNode is used to
     * handle the MediaStream. That node is then connected to the AnalyserNode (SRC -> AN) by default,
     * which facilitates visualization of the audio data.
     *
     * Note: Connection of the analyzer node to the script processor (AN -> SP) node will only be
     * establish during recording.
     */
    private setupAudioNodes(): void {
        if (this.audiocontext != undefined) {
            this.source = this.audiocontext.createMediaStreamSource(this.stream);
            this.analyser = this.audiocontext.createAnalyser();
            this.processor = this.audiocontext.createScriptProcessor();
            this.processor.onaudioprocess = (event) => this.process(event);
            this.bufferSource = this.audiocontext.createBufferSource();
            this.source.connect(this.analyser);

            /* Configure analyser and prepare data-structures needed for visualization. */
            this.analyser.fftSize = 2048;
            this.frequencyBinCount = this.analyser.frequencyBinCount;
            this.visualizationDataArray = new Uint8Array(this.frequencyBinCount);
        }
    }

    /**
     * This method is used as callback for the ScriptProcessorNode. It gets invoked whenever
     * the inputBuffer of the ScriptProcessNode is full. That data becomes available as part
     * of the AudioProcessingEvent.
     *
     * During recording, this method reads the data from the events inputBuffer, averages the channels
     * and saves the (1-channel) output to the recordingBuffer.
     *
     * @param event
     */
    private process(event: AudioProcessingEvent) {
        if (this.recording) {
            let inputBuffer = event.inputBuffer;
            let outputBuffer = new Float32Array(event.inputBuffer.length);
            for (let channel = 0; channel < inputBuffer.numberOfChannels; channel++ ) {
                inputBuffer.getChannelData(channel).forEach((value, index) => {
                    if (channel == 0) {
                        outputBuffer[index] = value/inputBuffer.numberOfChannels;
                    } else {
                        outputBuffer[index] += value/inputBuffer.numberOfChannels;
                    }
                })
            }

            this.recordingBuffer.push(outputBuffer);
        }

        console.log("Audio is being processed...");
    }

    /**
     * This method uses window.requestAnimationFrame() and passes itself as callback
     * to that method, which results in an infinite loop.
     *
     * Every time this method gets called, it visualizes the frequency distribution of the audio-stream
     * by evaluating the frequency-data in the AnalyzerNode and drawing it onto the canvas.
     */
    private visualize() {
        let rafID = window.requestAnimationFrame(() => this.visualize());
        let context = this.canvas.nativeElement.getContext("2d");
        let barWidth = (context.canvas.width / this.frequencyBinCount) * 2.5;
        let barHeight : number;
        let x = 0;

        this.analyser.getByteFrequencyData(this.visualizationDataArray);

        context.fillStyle = '#000000';
        context.fillRect(0, 0,context.canvas.width, context.canvas.height);

        for(let i = 0; i < this.frequencyBinCount; i++) {
            barHeight = this.visualizationDataArray[i];
            context.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
            context.fillRect(x,context.canvas.height-barHeight/2,barWidth,barHeight/2);
            x += barWidth + 1;
        }
    }
}