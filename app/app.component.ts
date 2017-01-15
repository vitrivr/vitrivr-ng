import { Component, Optional } from '@angular/core';

@Component({
  styles : [`
    md-sidenav {
        width: 300px;
    }
  `],
  selector: 'vitrivr',
  templateUrl: './app/app.component.html'
})


export class AppComponent  {
  isDarkTheme: boolean = false;
  lastDialogResult: string;

  foods: any[] = [
    {name: 'Pizza', rating: 'Excellent'},
    {name: 'Burritos', rating: 'Great'},
    {name: 'French fries', rating: 'Pretty good'},
  ];

  progress: number = 0;

}
