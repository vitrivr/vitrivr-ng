import {NgModule} from '@angular/core';
import {CollectionComponent} from "./collection.component";
import {MatPaginatorModule} from "@angular/material/paginator";

@NgModule({
  imports: [
    MatPaginatorModule
  ],
  declarations: [CollectionComponent],
  exports: [CollectionComponent],
})

export class CollectionModule {
}
