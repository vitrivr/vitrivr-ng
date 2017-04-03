export class TimeFormatterUtil {
    public static toTimer(milliseconds: number) {
        let seconds = milliseconds/1000;
        let minutes = 0
        let hours = 0;

        if (seconds > 3600) {
            hours = Math.floor(seconds/3600);
            seconds = seconds - hours*3600;
        }

        if (seconds > 60) {
            minutes = Math.floor(seconds / 60);
            seconds = seconds - minutes * 60;
        }

        seconds = Math.floor(seconds);

        return  ((hours < 10) ? "0"+hours : hours) + ":" + ((minutes < 10) ? "0"+minutes : minutes) + ":" + ((seconds < 10) ? "0"+seconds : seconds);
    }
}