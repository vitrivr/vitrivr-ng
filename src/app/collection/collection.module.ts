import {NgModule} from '@angular/core';
import {CollectionComponent} from "./collection.component";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatTableModule} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {PipesModule} from "../shared/pipes/pipes.module";
import {RouterModule} from "@angular/router";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";

@NgModule({
  imports: [
    MatPaginatorModule,
    MatProgressBarModule,
    MatTableModule,
    CommonModule,
    PipesModule,
    RouterModule,
    MatButtonModule,
    MatIconModule
  ],
  declarations: [CollectionComponent],
  exports: [CollectionComponent],
})

export class CollectionModule {
}
