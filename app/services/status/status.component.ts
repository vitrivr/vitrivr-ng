
import {Component, OnInit} from '@angular/core';
import {StatusService} from './status.service';
import {Observable} from 'rxjs/Rx';

@Component({
    selector: 'api-status',
    template:`
        <span >
            API Status:&nbsp;<md-icon style="vertical-align:text-bottom;">{{icon()}}</md-icon>&nbsp;{{latency !== undefined ? '(' + latency + 'ms)' : ''}}
        </span>
    `,
    providers: [StatusService]
})

export class StatusComponent implements OnInit {
    private apistatus : Status = new Status();
    private last : number;
    private latency: number;

    constructor(private statusService: StatusService) { }

    ngOnInit(): void {
        let timer  = Observable.timer(0,10000);
        timer.subscribe(t => {
            this.last = Date.now();
            this.statusService.getStatus().subscribe(status => {
                this.apistatus = status;
                this.latency = (Date.now() - this.last)
            });
        });
    }

    public icon() {
        switch (this.apistatus.status) {
            case 'DISCONNECTED':
                return 'flash_off';
            case 'ERROR':
                return 'error';
            case 'OK':
                return 'check_circle';
            case 'WAITING':
            default:
                return 'watch_later'
        }
    }
}

export interface StatusInterface {
    status: string
}
export class Status implements StatusInterface {
    status: string;
}