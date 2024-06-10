import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Config} from "../shared/model/config/config.model";
import {AppConfig} from "../app.config";
import {DresService} from "../core/basics/dres.service";
import {skip, tap} from "rxjs/operators";
import {ApiClientTaskTemplateInfo, ApiEvaluationState} from '../../../openapi/dres';

@Component({
  selector: 'app-dres-timer',
  template: `
    <div class="mat-body-2" *ngIf="config|GetConfigVariablePipe:competitionHost">
      {{statusStr}}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class DresTimerComponent implements OnInit {
  config: Config
  taskSecondsRemaining = 0
  countDownFun = null
  activeTask: ApiEvaluationState = null
  activeTemplate: ApiClientTaskTemplateInfo = null

  competitionHost = ((c: Config) => c._config.competition.host)
  statusStr: string = "loading task information..."

  constructor(private configService: AppConfig, private cdr: ChangeDetectorRef, private dresService: DresService) {
    this.configService.configAsObservable.subscribe(c => {
      this.config = c
      this.cdr.markForCheck()
    })
  }

  ngOnInit(): void {
    this.dresService.statusObservable().subscribe({
      error: _ => {
        this.statusStr = "Error while connecting to DRES"
        this.cdr.markForCheck()
      }
    })
    this.dresService.activeTaskObservable().pipe(
        skip(1), // skip initial value
        tap(task => {
          if (task) {
            if (task.taskStatus === 'RUNNING') {
              this.activeTask = task
              clearInterval(this.countDownFun)
              this.taskSecondsRemaining = task.timeLeft
              this.countDownFun = setInterval(() => this.tic(), 1000)
              this.renderSeconds()
              return
            }
          }
          this.countDownFun = null
          this.statusStr = "no active task"
          this.cdr.markForCheck()
        })
    )
    .subscribe()
    this.dresService.activeTemplateObservable().pipe(
      skip(1),
      tap(template => {
        if(template){
          this.activeTemplate = template;
          this.renderSeconds()
        }
      }))
  }

  private tic() {
    this.taskSecondsRemaining = Math.max(0, this.taskSecondsRemaining - 1)
    this.renderSeconds()
  }

  private renderSeconds() {
    this.statusStr = `${this.activeTemplate?.name}: ${DresTimerComponent.toHHMMSS(this.taskSecondsRemaining)} remaining`
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
