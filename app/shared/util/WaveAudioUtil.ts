export class WaveAudioUtil {
    /**
     * Converts the content of the provided AudioBuffer to a mono WAV file. The method
     * allows to re-sample the file to a lower sample rate.
     *
     * @param audio AudioBuffer that contains the data for the WAV file.
     * @param sampleRate Requested sample rate. Must be lower or equal to the sample rate in the AudioFile.
     */
    public static toMonoWav(audio: AudioBuffer, sampleRate: number = 44100): Blob {
        /* Calculate ratio of SampleRate and requested SampleRate. */
        let ratio = 1;
        if (audio.sampleRate > sampleRate &&  audio.sampleRate % sampleRate == 0) {
            ratio =  audio.sampleRate / sampleRate;
        } else {
            console.log("Requested sample rate of " + sampleRate + " is larger than actual sample rate of " + audio.sampleRate + " or the two rates don't have a common factor. Using the original sample rate!");
        }

        /* Allocate buffer and DataView for output. */
        let audioLength = (audio.length*2)/ratio;
        let buffer = new ArrayBuffer(44 + audioLength);
        let view = new DataView(buffer);

        /* Writes the RIFF WAVE header. */
        this.writeWavHeader(view, audioLength, sampleRate, 1);

        /* Writes actual adui data as 16bit Mono PCM. */
        this.floatTo16BitMonoPCM(view, audio, 44, ratio);

        /* Returns WAV file as Blob. */
        return new Blob([view], {type: "audio/wav"});
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
        view.setUint16(32, channels*2, true);
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
     * representation. This method merges different channels into one by calculating the mean value of all
     * the channels for every sample.
     *
     * @param output The DataView that should hold the output PCM data.
     * @param input AudioBuffer that acts as input.
     * @param offset Byte offset into the DataView.
     * @param ratio The ratio between input and output sample rate. Must be an integer value >= 1.
     */
    private static floatTo16BitMonoPCM(output: DataView, input: AudioBuffer, offset: number, ratio: number) {
        for (let i = 0; i < input.length; i+=ratio, offset+=2) {
            let sample: number = 0;
            for (let c = 0; c < input.numberOfChannels; c++) {
                for (let r=0;r<ratio;r++) {
                    sample += (Math.max(-1, Math.min(1, input.getChannelData(c)[i-r])) / (input.numberOfChannels*ratio));
                }
            }
            output.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        }
    }
}