import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

@Component({
  selector: 'record-audio',
  template: `
    <div>
        <canvas #visualize width='{{width}}' height='{{height}}' (drop)="onRecorderDropped($event)" (dragover)="onRecorderDragOver($event)"></canvas>
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
  /** Width and height of the visualization canvas. */
  @Input() width: number = 400;
  @Input() height: number = 150;
  /** Canvas used for visualization. */
  @ViewChild('visualize', {static: false}) private canvas: any;
  /** AudioContext used for audio signal processing. */
  private audiocontext: AudioContext;

  /** MediaStream that is obtained by calls to navigator.getUserMedia. Represents the microphone audio source.*/
  private stream: MediaStream;

  /** The SourceNode for audio. Uses the MediaStream coming from the microphone. */
  private source: MediaStreamAudioSourceNode;

  /** The AnalyserNode used to visualize the microphone input. */
  private analyser: AnalyserNode;

  /** The ScriptProcessorNode that does the actual audio recording. */
  private processor: ScriptProcessorNode;

  /** A AudioBufferSourceNode that can be used to play previously buffered audio. */
  private bufferSource: AudioBufferSourceNode;

  /** Array used to buffer data required for visualization of the audio-input. */
  private visualizationDataArray: Uint8Array;

  /** The number of frequency-bins (for visualization of the audio-input). */
  private frequencyBinCount: number;

  /** Buffers the raw PCM data during recording or after file-upload for later playback or storage. This array has one
   * Float32Array entry per recorded frame in the audio stream. The length of such a Float32Array depends on the
   * audio data.
   *
   * For 44100Hz sample rate its usually {44100 * channels} entries, i.e. 44100 entries for mono audio.
   */
  private recordingBuffer: AudioBuffer;

  /** Flag indicating whether any recording is currently taking place. */
  private recording: boolean = false;

  /** Flag indicating whether any playback is currently taking place. */
  private playing: boolean = false;

  /**
   * Requests access to the user's microphone. If this succeeds, a MediaStream object is passed
   * to the onStreamAvailable() method.
   */
  public ngOnInit() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.mediaDevices.getUserMedia);
    navigator.mediaDevices.getUserMedia({audio: true, video: false})
      .then(
        (stream: MediaStream) => this.onStreamAvailable(stream),
        (error) => this.onStreamError(error)
      );
    this.audiocontext = new AudioContext();
    this.setupAudioNodes();

  }

  /**
   * Stops the recording (if it's still running) and closes all open tracks, thus releasing
   * the media-stream.
   */
  public ngOnDestroy() {
    /* Stop playback. */
    this.stop();

    /* Invalidate the stream. */
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop()
      });
      this.stream = null;
    }

    /* Close the audio context. */
    if (this.audiocontext) {
      this.audiocontext.close();
      this.audiocontext = null;
    }
  }

  /**
   * Starts recording of audio. The actual audio recording is done in the process() method.
   */
  public record(): void {
    if (this.audiocontext == undefined) {
      return;
    }
    if (this.stream == undefined) {
      return;
    }
    if (!this.recording && !this.playing) {
      this.recordingBuffer = null;
      this.wireRecording();
      this.recording = true;
    }
  }

  /**
   * Returns true if recording is available and false otherwise.
   *
   * @return {boolean}
   */
  public recordingAvailable(): boolean {
    return this.source != null;
  }

  /**
   * Starts playback of previously recorded audio (if set).
   */
  public play(): void {
    if (this.audiocontext == undefined) {
      return;
    }
    if (!this.recording && !this.playing && this.recordingBuffer) {
      this.playing = true;
      this.bufferSource = this.audiocontext.createBufferSource();
      this.bufferSource.buffer = this.recordingBuffer;
      this.wirePlayback();
      this.bufferSource.start();
      this.bufferSource.onended = () => {
        this.wireIdle();
        this.playing = false;
      };
    }
  }

  /**
   * Stops either playback or recording, whatever is currently running.
   */
  public stop(): void {
    if (this.audiocontext == undefined) {
      return;
    }
    if (this.recording) {
      this.recording = false;
    }

    if (this.playing) {
      this.bufferSource.stop();
      this.bufferSource = null;
    }

    /* Wire to Idle mode. */
    this.wireIdle();
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
   * Returns the duration of the currently recorded audio-material.
   * If no material has been recorded, the value will be zero.
   *
   * @return Duration of the recorded material.
   */
  public duration(): number {
    if (this.recordingBuffer) {
      return this.recordingBuffer.duration;
    } else {
      return 0;
    }
  }

  /**
   * Returns the length of the currently recorded audio-material. If no material has been recorded,
   * the value will be zero.
   *
   * @return Duration of the recorded material.
   */
  public length(): number {
    if (this.recordingBuffer) {
      return this.recordingBuffer.length;
    } else {
      return 0;
    }
  }

  /**
   * Returns the sampleRate of the currently recorded audio-material. If no material
   * has been recorded, the value will be zero.
   *
   * @return Duration of the recorded material.
   */
  public sampleRate(): number {
    if (this.recordingBuffer) {
      return this.recordingBuffer.sampleRate;
    } else {
      return 0;
    }
  }

  /**
   * Returns the number of channels for of the currently recorded audio-material.
   * If no material has been recorded, the value will be zero.
   *
   * @return Duration of the recorded material.
   */
  public channels(): number {
    if (this.recordingBuffer) {
      return this.recordingBuffer.numberOfChannels;
    } else {
      return 0;
    }
  }

  /**
   *
   * @returns {AudioBuffer}
   */
  public data(): AudioBuffer {
    return this.recordingBuffer;
  }

  /**
   * Indicates whether the AudioRecordingComponent supports recording. This
   * mainly depends on the browser's capabilities.
   */
  public supportsRecording() {
    return this.audiocontext != undefined && this.stream != undefined;
  }

  /**
   * Tries to decode binary data from an array buffer and load it as
   * AudioStream. The loaded audio will be treated like recorded audio.
   *
   * @param data ArrayBuffer containing the data.
   */
  public loadAudioFromBuffer(data: ArrayBuffer) {
    if (this.audiocontext !== undefined && !this.recording) {
      this.audiocontext.decodeAudioData(data, (buffer) => {
        this.recordingBuffer = buffer;
      });
    }
  }

  /**
   * Tries to decode binary data from an array buffer and load it as
   * AudioStream. The loaded audio will be treated like recorded audio.
   *
   * @param file File that should be loaded.
   */
  public loadAudioFromFile(file: File) {
    if (this.isPlaying() || this.isRecording()) {
      this.stop();
    }
    let reader = new FileReader();
    reader.addEventListener('load', () => {
      this.loadAudioFromBuffer(<ArrayBuffer>reader.result);
    });
    reader.readAsArrayBuffer(file);
  }

  /**
   * Fired whenever something is dragged over the recorder.
   *
   * @param event
   */
  public onRecorderDragOver(event: any) {
    event.preventDefault();
  }

  /**
   * Handles the case in which an object is dropped over the recorder. If the object is a file, that
   * object is treated as audio and loaded.
   *
   * @param event Drop event
   */
  public onRecorderDropped(event: any) {
    /* Prevent propagation. */
    event.preventDefault();
    event.stopPropagation();

    /* Extract file (if available) and display it. */
    if (event.dataTransfer.files.length > 0) {
      this.loadAudioFromFile(event.dataTransfer.files.item(0));
    }
  }

  /**
   * Called, when a stream becomes available.
   *
   * @param stream The MediaStream that became available.
   */
  private onStreamAvailable(stream: MediaStream) {
    this.stream = stream;
    this.source = this.audiocontext.createMediaStreamSource(this.stream);
    this.wireIdle();
    this.visualize();
  }

  /**
   * Called, when obtaining a stream fails with an error.
   *
   * @param error
   */
  private onStreamError(error: any) {
    console.log(error);
    this.wireIdle();
    this.visualize();
  }

  /**
   * Wires the AudioNodes for audio recording.
   *
   * (SRC -> AN -> SP -> DST)
   */
  private wireRecording() {
    this.unwire();
    if (this.source) {
      this.source.connect(this.analyser);
      this.analyser.connect(this.processor);
      this.processor.connect(this.audiocontext.destination);
    }
  }

  /**
   * Wires the AudioNodes for audio playback.
   *
   * (BSRC -> AN -> DST)
   */
  private wirePlayback() {
    this.unwire();
    if (this.bufferSource) {
      this.bufferSource.connect(this.analyser);
      this.analyser.connect(this.audiocontext.destination);
    }
  }

  /**
   * Wires the AudioNodes for Idle mode (no recording, no playback)
   *
   * (SRC -> AN)
   */
  private wireIdle() {
    this.unwire();
    if (this.source) {
      this.source.connect(this.analyser);
    }
  }

  /**
   * Un-wires all AudioNodes.
   */
  private unwire() {
    if (this.source) {
      this.source.disconnect();
    }
    if (this.analyser) {
      this.analyser.disconnect();
    }
    if (this.processor) {
      this.processor.disconnect();
    }
    if (this.bufferSource) {
      this.bufferSource.disconnect();
    }
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
      this.analyser = this.audiocontext.createAnalyser();
      this.processor = this.audiocontext.createScriptProcessor();
      this.processor.onaudioprocess = (event) => this.process(event.inputBuffer);
      this.bufferSource = this.audiocontext.createBufferSource();

      /* Configure analyser and prepare data-structures needed for visualization. */
      this.analyser.fftSize = 2048;
      this.frequencyBinCount = this.analyser.frequencyBinCount;
      this.visualizationDataArray = new Uint8Array(this.frequencyBinCount);

      /* Wire for idle mode. */
      this.wireIdle();
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
   * @param input
   */
  private process(input: AudioBuffer) {
    let buffer: AudioBuffer;
    if (this.recordingBuffer == null) {
      buffer = this.audiocontext.createBuffer(input.numberOfChannels, input.length, input.sampleRate);
    } else {
      buffer = this.audiocontext.createBuffer(input.numberOfChannels, this.recordingBuffer.length + input.length, input.sampleRate);
    }

    for (let c = 0; c < input.numberOfChannels; c++) {
      if (this.recordingBuffer != null) {
        buffer.copyToChannel(this.recordingBuffer.getChannelData(c), c, 0);
        buffer.copyToChannel(input.getChannelData(c), c, this.recordingBuffer.length);
      } else {
        buffer.copyToChannel(input.getChannelData(c), c, 0);
      }
    }

    this.recordingBuffer = buffer;
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
    let context = this.canvas.nativeElement.getContext('2d');
    let barWidth = (context.canvas.width / this.frequencyBinCount) * 2.5;
    let barHeight: number;
    let x = 0;
    let color = '';
    if (this.playing) {

    }

    this.analyser.getByteFrequencyData(this.visualizationDataArray);

    context.fillStyle = '#000000';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);

    for (let i = 0; i < this.frequencyBinCount; i++) {
      barHeight = this.visualizationDataArray[i];
      if (this.playing) {
        context.fillStyle = 'rgb(50,' + (barHeight + 100) + ',50)';
      }
      if (this.recording) {
        context.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      }
      if (!this.playing && !this.recording) {
        context.fillStyle = 'rgb(50,50,' + (barHeight + 100) + ')';
      }
      context.fillRect(x, context.canvas.height - barHeight / 2, barWidth, barHeight / 2);
      x += barWidth + 1;
    }
  }
}
