import {Subject, Observer, Observable} from 'rxjs/Rx';

/**
 * Custom type used to indicate the status of the WebSocket status.
 */
export type WebSocketStatus = "DISCONNECTED" | "WAITING" | "ERROR" ;
export abstract class AbstractWebsocketService {
    /* WebSocket used by the AbstractWebsocketService implementation. */
    private _socket : Subject<any> = null;

    /* Indication of the status status. */
    private _status : WebSocketStatus = "DISCONNECTED";

    /* URL of the endpoint. */
    protected _url: string;

    /**
     * Default constructor.
     *
     * @param reestablish If true, the socket will try to re-establish status after an error or a close.
     */
    constructor (private reestablish : boolean = true) {}

    /**
     * Connects the AbstractWebsocketService to an endpoint.
     *
     * @param url The URL of the WebSocket endpoint.
     *
     * @returns {any}
     */
    public connect(url?: string) {
        /* IF a socket is open; disconnect it. */
        this.disconnect();

        /* Assign URL (if set). */
        if (url) this._url = url;

        /* Create Socket: Once status was established, change status to 'WAITING'. */
        let socket = new WebSocket(this._url);
        socket.onopen = () => {
            this._status = "WAITING";
        };

        let observable = Observable.create(
            (observer: Observer<MessageEvent>) => {
                socket.onmessage = observer.next.bind(observer);
                socket.onerror = observer.error.bind(observer);
                socket.onclose = observer.complete.bind(observer);
                return socket.close.bind(socket);
            }
        );

        let observer = {
            next: (data: Object) => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(data);
                }
            },
        };

        this._socket = Subject.create(observer, observable);
        this._socket.subscribe(
            message => {
                this.onSocketMessage(message.data)
            },
            error => {
                this.onSocketError(error);
            },
            () => {
                this.onSocketClose();
            }
        );

        /* Log the successful status of the socket. */
        console.log("Socket connected to: " + this._url);
    }

    /**
     * Disconnects the AbstractWebsocketService from an endpoint.
     *
     * @return {boolean}
     */
    public disconnect(): boolean {
        if (!this._socket) return false;

        /* Disconnect the current socket. */
        this._socket.complete();
        this._socket = null;
        this._status = "DISCONNECTED";
        console.log("Socket disconnected from: " + this._url);
    }

    /**
     * Getter for WebSocket status.
     *
     * @return {WebSocketStatus}
     */
    get status(): WebSocketStatus {
        return this._status;
    }

    /**
     * Sends an object to the underlying WebSocket stream. That object
     * gets serialized to JSON before it's being sent.
     *
     * Important: All properties that start with an _ are filtered out
     * when stringified.
     *
     * @param object Object to send.
     */
    public send(object: any) : boolean {
        return this.sendstr(JSON.stringify(object, (key, value) => {
            if (key.startsWith("_")) {
                return undefined;
            } else {
                return value
            }
        }));
    }

    /**
     * Sends a raw string to the underlying WebSocket stream.
     *
     * @param str String to write to the stream.
     */
    protected sendstr(str: string) : boolean {
        if (this._status == "WAITING") {
            this._socket.next(str);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Dispatches a new timer that will wait for 30seconds and try to re-establish the status.
     */
    protected dispatchTimer() : void {
        console.log("Dispatching timer to re-establish status in 30s...");
        Observable.timer(30000).first().subscribe(() => {
            console.log("Re-establishing status.");
            this.connect();
        });
    }


    /**
     * This method is invoked whenever the WebSocket receives a message from
     * the remote host.
     *
     * @param message
     */
    protected abstract onSocketMessage(message : String) : void;

    /**
     * This method is invoked whenever the WebSocket reports a status error.
     *
     * @param error
     */
    protected onSocketError(error : any) {
        console.log("Error occurred with socket to '" + this._url + "':" + error);
        this._status = "ERROR";
        this._socket = null;
        if (this.reestablish) this.dispatchTimer();
    };

    /**
     * This method is invoked whenever the WebSocket reports that it was closed.
     */
    protected onSocketClose() : void {
        console.log("Socket to '" + this._url + "' was closed.");
        this._status = "DISCONNECTED";
        this._socket = null;
        if (this.reestablish) this.dispatchTimer();
    }
}