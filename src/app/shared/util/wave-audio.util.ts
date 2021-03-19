export class WaveAudioUtil {

  /**
   * Converts the content of the provided AudioBuffer to a mono WAV file. The method
   * allows to re-sample the file to a lower sample rate.
   *
   * @param audio AudioBuffer that contains the data for the WAV file.
   * @param channels Number of channels in the output. If it does not coincide with the sampleRate of the data, that data will be re-sampled.
   * @param sampleRate Samplerate of the output. If it does not coincide with the sampleRate of the data, that data will be re-sampled.
   * @return {PromiseLike<Blob>}
   */
  public static toWav(audio: AudioBuffer, channels: number, sampleRate: number) {
    /* Check if AudioDate needs re-sampling. */
    return WaveAudioUtil.resample(audio, channels, sampleRate).then((resampled: AudioBuffer) => {
      /* Allocate buffer and DataView for output. */
      const audioLength = (resampled.length * resampled.numberOfChannels * 2);
      const buffer = new ArrayBuffer(44 + audioLength);
      const view = new DataView(buffer);

      /* Writes the RIFF WAVE header. */
      this.writeWavHeader(view, audioLength, resampled.sampleRate, 1);

      /* Writes actual adui data as 16bit Mono PCM. */
      this.floatToShortPCM(view, resampled, 44);

      /* Returns WAV file as Blob. */
      return new Blob([view], {type: 'audio/wav'});
    });
  }

  /**
   * Resamples provided AudioData with the provided settings for channels and sampleRate. If the data already has the desired specs, no re-sampling
   * will take place.
   *
   * @param audio AudioBuffer that should be resampled
   * @param channels Number of channels in the output. If it does  coincide with the sampleRate of the data, that data will not be re-sampled.
   * @param sampleRate Samplerate of the output. If it not coincide with the sampleRate of the data, that data will not be re-sampled.
   * @returns {PromiseLike<AudioBuffer>}
   */
  public static resample(audio: AudioBuffer, channels: number, sampleRate: number) {
    /* If no resampling is necessary, just return a promise. */
    if (audio.sampleRate === sampleRate && audio.numberOfChannels === channels) {
      return Promise.resolve(audio);
    }

    /* Otherwise resample audio. */
    const ratio = sampleRate / audio.sampleRate;
    const ctx = new OfflineAudioContext(channels, Math.ceil(audio.length * ratio), sampleRate);
    const src = ctx.createBufferSource();
    src.buffer = audio;
    src.connect(ctx.destination);
    src.start();
    return ctx.startRendering();
  }

  /**
   * Writes a RIFF Wave header for wave containing a 16bit PCM audio stream.
   *
   * @param view
   * @param length
   * @param sampleRate
   * @param channels
   */
  private static writeWavHeader(view: DataView, length: number, sampleRate: number, channels: number) {
    /* RIFF identifier */
    this.writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, (36 + length), true);
    /* RIFF type */
    this.writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    this.writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, channels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, channels * 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this.writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, length, true);
  }

  /**
   * Helper method to write a String into a DataView.
   *
   * @param view DataView to use.
   * @param offset Offset in bytes.
   * @param string String to write.
   */
  private static writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }


  /**
   * Converts a 32bit IEEE float audio stream (as contained in an AudioBuffer) into a 16bit Integer PCM
   * representation.
   *
   * @param output The DataView that should hold the output PCM data.
   * @param input AudioBuffer that acts as input.
   * @param offset Byte offset into the DataView.
   */
  private static floatToShortPCM(output: DataView, input: AudioBuffer, offset: number) {
    for (let i = 0; i < input.length; i += 1, offset += 2) {
      for (let c = 0; c < input.numberOfChannels; c++) {
        const sample = (Math.max(-1, Math.min(1, input.getChannelData(c)[i])));
        output.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      }
    }
  }
}
