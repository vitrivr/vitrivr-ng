"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var status_service_1 = require('./status.service');
var Rx_1 = require('rxjs/Rx');
var StatusComponent = (function () {
    function StatusComponent(statusService) {
        this.statusService = statusService;
        this.apistatus = new Status();
    }
    StatusComponent.prototype.ngOnInit = function () {
        var _this = this;
        var timer = Rx_1.Observable.timer(0, 10000);
        timer.subscribe(function (t) {
            _this.last = Date.now();
            _this.statusService.getStatus().subscribe(function (status) {
                _this.apistatus = status;
                _this.latency = (Date.now() - _this.last);
            });
        });
    };
    StatusComponent.prototype.icon = function () {
        switch (this.apistatus.status) {
            case 'DISCONNECTED':
                return 'flash_off';
            case 'ERROR':
                return 'error';
            case 'OK':
                return 'check_circle';
            case 'WAITING':
            default:
                return 'watch_later';
        }
    };
    StatusComponent = __decorate([
        core_1.Component({
            selector: 'api-status',
            template: "\n        <span >\n            API Status:&nbsp;<md-icon style=\"vertical-align:text-bottom;\">{{icon()}}</md-icon>&nbsp;{{latency !== undefined ? '(' + latency + 'ms)' : ''}}\n        </span>\n    ",
            providers: [status_service_1.StatusService]
        }), 
        __metadata('design:paramtypes', [status_service_1.StatusService])
    ], StatusComponent);
    return StatusComponent;
}());
exports.StatusComponent = StatusComponent;
var Status = (function () {
    function Status() {
    }
    return Status;
}());
exports.Status = Status;
//# sourceMappingURL=status.component.js.map