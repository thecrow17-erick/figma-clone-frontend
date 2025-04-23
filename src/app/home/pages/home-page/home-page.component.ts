import {  Component } from '@angular/core';
import { MaterialModule } from '../../../material';
import { HeaderProfileComponent, RoomsGridComponent } from '../../components';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    MaterialModule,
    HeaderProfileComponent,
    RoomsGridComponent
  ],
  templateUrl: "./home-page.component.html"
})
export class HomePageComponent {}
