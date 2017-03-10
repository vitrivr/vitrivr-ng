import {NgModule}      from '@angular/core';
import {M3DRenderService} from "./m3d-render.service";
import {M3DViewerService} from "./m3d-viewer.service";


@NgModule({
    imports:      [ ],
    declarations: [ ],
    providers:    [ M3DRenderService, M3DViewerService ]
})

export class M3DRenderModule { }
