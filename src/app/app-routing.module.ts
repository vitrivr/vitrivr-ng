import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ObjectdetailsComponent} from './objectdetails/objectdetails.component';
import {GalleryComponent} from './results/gallery/gallery.component';
import {MiniGalleryComponent} from './results/gallery/mini-gallery.component';
import {ListComponent} from './results/list/list.component';
import {TemporalListComponent} from './results/temporal/temporal-list.component';
import {SegmentdetailsComponent} from './segmentdetails/segmentdetails.component';
import {CollectionComponent} from "./collection/collection.component";

/**
 * Defines the application's routes.
 */
const appRoutes: Routes = [
  {
    path: 'mediaobject/:objectId',
    component: ObjectdetailsComponent
  },
  {
    path: 'mediasegment/:segmentId',
    component: SegmentdetailsComponent
  },
  {path: 'collection', component: CollectionComponent},
  {path: 'gallery', component: GalleryComponent},
  {path: 'list', component: ListComponent},
  {path: 'temporal-list', component: TemporalListComponent},
  {path: 'mini-gallery', component: MiniGalleryComponent},
  {path: '', component: MiniGalleryComponent}
];

@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { relativeLinkResolution: 'legacy' })
  ],
  exports: [
    RouterModule
  ],
  providers: []
})

export class AppRoutingModule {
}
