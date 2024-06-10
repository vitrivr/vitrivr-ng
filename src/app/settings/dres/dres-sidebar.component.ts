import {AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import {Config} from '../../shared/model/config/config.model';
import {NotificationService} from '../../core/basics/notification.service';
import {AppConfig} from '../../app.config';
import {DresService} from '../../core/basics/dres.service';
import {ApiUser} from '../../../../openapi/dres';

@Component({
  selector: 'app-dres-sidebar',
  templateUrl: './dres.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DresSidebarComponent implements AfterContentInit {
  config: Config;
  dresStatusBadge: string;
  dresStatus: ApiUser = null
  dresAddress = ((c: Config) => c._config.competition.host);

  constructor(
    private _configService: AppConfig,
    private _notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
    protected _dresService: DresService
  ) {
  }

  ngAfterContentInit(): void {
    console.log("ngAfterContentInit")
    this._configService.configAsObservable.subscribe(c => {
      this.config = c
    })
    this._dresService.statusObservable().subscribe({
      next: (status) => {
        if (status) {
          this.dresStatus = status
          this.cdr.markForCheck()
        }
      }
    })

    this._notificationService.getDresStatusBadgeObservable().subscribe(el => {
      this.dresStatusBadge = el
      this.cdr.markForCheck()
    })
  }

  login(username: string, password: string) {
    this._dresService.loginByUsernamePassword(username, password).subscribe((value) => {
      console.log("Subscribe of login")
      this.dresStatus = value;
      console.log("user:", value);
      this.cdr.markForCheck();
      this.ngAfterContentInit();
    })
  }

  setEval(id: string) {
    this._dresService.setEval(id)
  }
}
