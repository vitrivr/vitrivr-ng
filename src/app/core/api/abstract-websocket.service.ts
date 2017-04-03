import {Injectable} from "@angular/core";
import {Subject, Observer, Observable} from 'rxjs/Rx';

/**
 * Custom type used to indicate the status of the WebSocket connection.
 */
export type WebSocketStatus = "DISCONNECTED" | "WAITING" | "ERROR" ;

@Injectable()
export abstract class AbstractWebsocketService {
    /* WebSocket used by the AbstractWebsocketService implementation. */
    protected _socket : Subject<any> = null;

    /* Indication of the connection status. */
    protected connection : WebSocketStatus = "DISCONNECTED";

    /**
     * Default constructor.
     *
     * @param _url The endpoint to which a WebSocket connection should be established.
     * @param reestablish If true, the socket will try to re-establish connection after an error or a close.
     */
    constructor (private _url: string, private reestablish : boolean = true) {
        this.createSocket();
    }

    /**
     *
     * @returns {any}
     */
    protected createSocket() {
        /* Create Socket: Once connection was established, change status to 'WAITING'. */
        let socket = new WebSocket(this._url);
        socket.onopen = function () {this.connection = "WAITING";}.bind(this);

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

        /* Log the successful connection of the socket. */
        console.log("Socket connected to: " + this._url);
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
        if (this.connection == "WAITING") {
            this._socket.next(str);
            return true;
        } else {
            return false;
        }
    }

    /**
     * Dispatches a new timer that will wait for 30seconds and try
     * to re-establish the connection.
     */
    protected dispatchTimer() : void {
        console.log("Dispatching timer to re-establish connection in 30s...");
        let timer = Observable.timer(30000);
        timer.first().subscribe(function() {
            console.log("Re-establishing connection.");
            this.createSocket();
        }.bind(this));
    }


    /**
     * This method is invoked whenever the WebSocket receives a message from
     * the remote host.
     *
     * @param message
     */
    protected abstract onSocketMessage(message : String) : void;

    /**
     * This method is invoked whenever the WebSocket reports a connection error.
     *
     * @param error
     */
    protected onSocketError(error : any) {
        console.log("Error occurred with socket to '" + this._url + "':" + error);
        this.connection = "ERROR";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.reestablish) this.dispatchTimer();
    };

    /**
     * This method is invoked whenever the WebSocket reports that it was closed.
     */
    protected onSocketClose() : void {
        console.log("Socket to '" + this._url + "' was closed.");
        this.connection = "DISCONNECTED";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.reestablish) this.dispatchTimer();
    }
}