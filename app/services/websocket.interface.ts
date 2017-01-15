import {Configuration} from "../configuration/app.config";
import {Injectable} from "@angular/core";
import {Subject, Observer, Observable} from 'rxjs/Rx';


/**
 * General interface for WebsocketServices.
 */
export interface WebsocketServiceInterface {
    _configuration: Configuration;
    _url : string;
    url(path : string) : string;
}

/**
 * Custom type used to indicate the status of the WebSocket connection.
 */
export type WebSocketStatus = "DISCONNECTED" | "WAITING" | "ERROR" ;


@Injectable()
export abstract class AbstractWebsocketService<T> implements WebsocketServiceInterface {
    /* WebSocket used by the AbstractWebsocketService implementation. */
    protected _socket : Subject<any> = null;

    /* Indication of the connection status. */
    public connection : WebSocketStatus = "DISCONNECTED";

    /* The URL of the WebSocket endpoint that is being invoked by the AbstractWebsocketService implementation. */
    _url : string;

    /**
     * The Observable for the service that everyone can subscribe to. The service uses this observable
     * to notify the subscribers about changes.
     */
    public observable : Observable<T> = Observable.create(
        (observer: Observer<T>) => {
            this.onServiceClose = observer.complete.bind(observer);
            this.onServiceError = observer.error.bind(observer);
            this.onServiceNext = observer.next.bind(observer);
        }
    );

    protected onServiceError : any;
    protected onServiceNext : any;
    protected onServiceClose : any;

    /**
     *
     * @param _configuration
     * @param path
     */
    constructor (public _configuration: Configuration, path : string) {
        this._url = this.url(path);
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
     *
     * @param path
     * @returns {string}
     */
    public url(path: String) : string {
        return this._configuration.endpoint_ws + path;
    }

    /**
     *
     * @param object
     */
    protected send(object: any) : boolean {
        if (this.connection == "WAITING") {
            this._socket.next(JSON.stringify(object));
            return true;
        } else {
            return false;
        }
    }

    /**
     *
     * @param str
     */
    protected sendstr(str: string) : void {
        this._socket.next(str);
    }

    /**
     *
     * @param message
     */
    public abstract onSocketMessage(message : String) : void;

    /**
     *
     * @param message
     */
    public onSocketError(error : any) {
        console.log("Error occurred with socket to '" + this._url + "':" + error);
        this.connection = "ERROR";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.onServiceError != undefined) this.onServiceError(error);
    };

    /**
     *
     * @param message
     */
    public onSocketClose() : void {
        console.log("Socket to '" + this._url + "' was closed.");
        this.connection = "DISCONNECTED";
        this._socket.unsubscribe();
        this._socket = null;
        if (this.onServiceClose != undefined) this.onServiceClose();
    }
}