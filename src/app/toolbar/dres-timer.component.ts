import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Config} from "../shared/model/config/config.model";
import {AppConfig} from "../app.config";
import {DresService} from "../core/basics/dres.service";
import {skip, tap} from "rxjs/operators";
import {ClientTaskInfo} from "../../../openapi/dres";

@Component({
  selector: 'app-dres-timer',
  template: `
    <div class="mat-body-2" *ngIf="initialized && config|GetConfigVariablePipe:competitionHost">
      <ng-container *ngIf="countDownFun === null">no active task</ng-container>
      <ng-container *ngIf="countDownFun">{{activeTask.name}}: {{timeStr}} remaining</ng-container>
    </div>
    <div class="mat-body-2" *ngIf="!initialized && config|GetConfigVariablePipe:competitionHost">
      loading task information
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DresTimerComponent implements OnInit {
  config: Config
  taskSecondsRemaining = 0
  countDownFun = null
  initialized = false
  activeTask: ClientTaskInfo = null

  competitionHost = ((c: Config) => c._config.competition.host)
  timeStr: string;

  constructor(private configService: AppConfig, private cdr: ChangeDetectorRef, private dresService: DresService) {
    this.configService.configAsObservable.subscribe(c => {
      this.config = c
      this.cdr.markForCheck()
    })
  }

  ngOnInit(): void {
    this.dresService.activeTaskObservable().pipe(
        skip(1), // skip initial value
        tap(task => {
          if (task) {
            if (task.running) {
              this.activeTask = task
              clearInterval(this.countDownFun)
              this.taskSecondsRemaining = task.remainingTime
              this.countDownFun = setInterval(() => this.tic(), 1000)
              return
            }
          }
          this.countDownFun = null
        }),
        tap(() => this.renderSeconds()),
        tap(() => this.initialized = true),
    )
    .subscribe()
  }

  private tic() {
    this.taskSecondsRemaining = Math.max(0, this.taskSecondsRemaining - 1)
    this.renderSeconds()
  }

  private renderSeconds() {
    this.timeStr = DresTimerComponent.toHHMMSS(this.taskSecondsRemaining)
    this.cdr.markForCheck()
  }

  private static toHHMMSS(secs): string {
    const sec_num = parseInt(secs, 10);
    const hours = Math.floor(sec_num / 3600);
    const minutes = Math.floor(sec_num / 60) % 60;
    const seconds = sec_num % 60;

    let relevant = [];
    if (hours > 0) {
      relevant = [hours, minutes, seconds]
    } else {
      relevant = [minutes, seconds]
    }
    return relevant
    .map(v => v < 10 ? "0" + v : v)
    .filter((v, i) => v !== "00" || i > 0)
    .join(":")
  }

}
