import {NgModule} from '@angular/core';
import {CollectionComponent} from "./collection.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTableModule} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {PipesModule} from "../shared/pipes/pipes.module";

@NgModule({
  imports: [
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    CommonModule,
    PipesModule
  ],
  declarations: [CollectionComponent],
  exports: [CollectionComponent],
})

export class CollectionModule {
}
