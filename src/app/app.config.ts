import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Config} from './shared/model/config/config.model';
import {HttpClient} from '@angular/common/http';
import {UUIDGenerator} from './shared/util/uuid-generator.util';

/**
 * A service providing the application's configuration and means to (re) load it.
 * Also loads a default configuration in case there is none provided on the server.
 */
@Injectable()
export class AppConfig {


  static settings: Config;
  private static settingsSubject = new BehaviorSubject<Config>(null);
  private handler: ProxyHandler<Config> = {
    set: (obj: Config, prop, value: any) => {
      obj[prop] = value;
      AppConfig.settingsSubject.next(AppConfig.settings);
      return true;
    }
  } as ProxyHandler<Config>;

  constructor(private http: HttpClient) {
  }

  /**
   * Returns the current configuration
   */
  get config(): Config {
    return AppConfig.settings;
  }

  /**
   * Returns the current configuration as observable. Can be used to monitor changes.
   */
  get configAsObservable(): Observable<Config> {
    return AppConfig.settingsSubject.asObservable();
  }

  /**
   * Loads the default configuration from a JSON file.
   */
  load() {
    // const jsonFile = 'config.json?random=' + Date.now();
    const jsonFile = 'config.json?r=' + UUIDGenerator.suid();
    // const jsonFile = 'config.json';
    return new Promise<void>((resolve, reject) => {
      this.http.get(jsonFile).toPromise().then((response: Config) => {
        AppConfig.settings = new Proxy<Config>(Config.deserialize(response) as Config, this.handler);
        AppConfig.settingsSubject.next(AppConfig.settings);
        resolve();
      }).catch((response: any) => {
        AppConfig.settings = new Proxy<Config>(new Config(), this.handler);
        AppConfig.settingsSubject.next(AppConfig.settings);
        console.log(`Could not load config file '${jsonFile}'. Fallback to default.`);
        resolve();
      });
    });
  }
}
