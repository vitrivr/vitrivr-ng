import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
import {QueryService} from "./services/queries/queries.service";

platformBrowserDynamic().bootstrapModule(AppModule);
