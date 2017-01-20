import {Injectable} from "@angular/core";
import {Configuration} from "../../configuration/app.config";
import {Message, MessageType} from "../../types/messages.types";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {AbstractWebsocketService} from "../../classes/communication/AbstractWebsocketService";


@Injectable()
export class CineastAPI extends AbstractWebsocketService {
    /** A Map conatining all the MessageTypes and associated BehaviourSubjects. Must
     * be initialized in the constructor!
     */
    private messages : BehaviorSubject<[MessageType, string]>;

    /**
     * Default constructor.
     *
     * @param _configuration Gets injected by DI.
     */
    constructor(_configuration : Configuration) {
        super(_configuration.endpoint_ws, true);
        let init : [MessageType, string] = ["INIT", JSON.stringify({messagetype:'INIT'})];
        this.messages = new BehaviorSubject(init);
        console.log("Cineast API Service is up and running!");
    }


    /**
     * This method can be used by the caller to get an Observer for messages received by the local
     * Cineast API endpoint. It is up to the describer to subscribe to the Observer.
     *
     * Note: Use Observer.filter() to filter for message-types
     *
     * @returns {Observable<[MessageType, string]>}
     */
    public observable() {
        return this.messages.asObservable();
    }


    /**
     * This is where the magic happens: Subscribes to messages from the underlying WebSocket and orchestrates the
     * assembly of the individual pieces of QueryResults.
     *
     * @param message
     */
    onSocketMessage(message: string): void {
        let msg : Message = <Message>JSON.parse(message);
        if (msg.messagetype != undefined) {
            let pair : [MessageType, string] = [msg.messagetype, message];
            this.messages.next(pair);
        }
    }
}